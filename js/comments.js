(function () {
  'use strict';

  var config = window.MistlaneCommentsConfig || {};
  var apiBase = config.apiBase || '/api';
  var siteKey = config.turnstileSiteKey || '';
  var state = {
    root: null,
    me: null,
    comments: [],
    replyTo: null,
    pendingComment: null,
    turnstileId: null,
    turnstileToken: '',
    codeSent: false,
    emojiOpen: false
  };
  var emojis = ['😀', '😄', '🤔', '🎉', '👍', '👏', '❤️', '✨', '📌', '💡', '☕', '🎈'];

  function request(path, options) {
    options = options || {};
    options.credentials = 'same-origin';
    options.headers = Object.assign({ Accept: 'application/json' }, options.headers || {});
    return fetch(apiBase + path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (payload) {
        if (!response.ok) throw new Error(payload.error || '请求失败，请稍后重试');
        return payload;
      });
    });
  }

  function getPost() {
    var canonical = document.querySelector('link[rel="canonical"]');
    var url = canonical ? canonical.href : window.location.href.split('#')[0];
    var parsed = new URL(url, window.location.origin);
    return {
      path: parsed.pathname,
      url: parsed.origin + parsed.pathname,
      title: (document.querySelector('meta[property="og:title"]') || {}).content || document.title.replace(/\s*[-|].*$/, '')
    };
  }

  function mount() {
    var mountPoint = document.querySelector('#post-comment .comment-wrap > div');
    if (!mountPoint || mountPoint.dataset.mistlaneCommentsMounted === 'true') return;
    mountPoint.dataset.mistlaneCommentsMounted = 'true';
    state.root = createShell();
    mountPoint.replaceChildren(state.root);
    bindEvents();
    loadSession();
    loadComments();
  }

  function createShell() {
    var root = document.createElement('section');
    root.className = 'mistlane-comments';
    root.innerHTML = [
      '<div class="mistlane-comments__summary">',
      '<span><strong data-role="comment-count">评论</strong><span data-role="comment-count-suffix"></span></span>',
      '<button class="comment-link-button" type="button" data-action="refresh">刷新</button>',
      '</div>',
      '<form class="comment-composer" novalidate>',
      '<div data-role="composer-avatar" class="comment-avatar-fallback" aria-hidden="true">评</div>',
      '<div class="comment-composer__body">',
      '<div data-role="profile-area"></div>',
      '<div class="comment-reply-bar" data-role="reply-bar" hidden><span>回复 <strong data-role="reply-name"></strong></span><button class="comment-reply-cancel" type="button" data-action="cancel-reply">取消</button></div>',
      '<textarea class="comment-textarea" data-role="content" maxlength="500" placeholder="留下你的想法，友善交流。" aria-label="评论内容"></textarea>',
      '<div class="comment-preview" data-role="preview"></div>',
      '<div class="comment-composer__footer">',
      '<button class="comment-icon-button" type="button" data-action="emoji" title="插入表情" aria-label="插入表情"><i class="far fa-smile"></i></button>',
      '<button class="comment-text-button" type="button" data-action="preview">预览</button>',
      '<button class="comment-submit" type="submit" data-role="submit">发送</button>',
      '<span class="comment-character-count" data-role="count">0 / 500</span>',
      '</div>',
      '<div class="comment-emoji-menu" data-role="emoji-menu" aria-label="表情选择"></div>',
      '<div class="comment-verification" data-role="verification">',
      '<p>验证码已发送至 <strong data-role="verify-email"></strong>，请完成验证后发布评论。</p>',
      '<div class="comment-verification__row">',
      '<input class="comment-code-input" data-role="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="六位验证码" aria-label="邮箱验证码">',
      '<button class="comment-submit" type="button" data-action="verify-code">验证并发送</button>',
      '<button class="comment-text-button" type="button" data-action="resend-code">重新发送</button>',
      '</div>',
      '<div class="comment-turnstile" data-role="turnstile"></div>',
      '</div>',
      '<p class="comment-status" data-role="status" role="status" aria-live="polite"></p>',
      '</div>',
      '</form>',
      '<div class="comments-list" data-role="comments-list"><div class="comments-loading">正在加载评论…</div></div>',
      '<section class="comments-admin" data-role="admin" hidden><h3>待审核评论</h3><div data-role="admin-list"></div></section>'
    ].join('');
    emojis.forEach(function (emoji) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = emoji;
      button.dataset.emoji = emoji;
      button.setAttribute('aria-label', '插入表情 ' + emoji);
      root.querySelector('[data-role="emoji-menu"]').appendChild(button);
    });
    return root;
  }

  function bindEvents() {
    state.root.querySelector('.comment-composer').addEventListener('submit', function (event) {
      event.preventDefault();
      submitComposer();
    });
    state.root.addEventListener('click', handleClick);
    state.root.querySelector('[data-role="content"]').addEventListener('input', updateCharacterCount);
  }

  function handleClick(event) {
    var actionNode = event.target.closest('[data-action]');
    if (actionNode) {
      var action = actionNode.dataset.action;
      if (action === 'refresh') loadComments();
      if (action === 'emoji') toggleEmojiMenu(actionNode);
      if (action === 'preview') togglePreview();
      if (action === 'cancel-reply') setReplyTarget(null);
      if (action === 'verify-code') verifyCode();
      if (action === 'resend-code') resendCode();
      if (action === 'reply') setReplyTarget(findComment(actionNode.dataset.commentId));
      if (action === 'delete') deleteComment(actionNode.dataset.commentId);
      if (action === 'approve') moderateComment(actionNode.dataset.commentId, 'approved');
      if (action === 'reject') moderateComment(actionNode.dataset.commentId, 'rejected');
      return;
    }

    var emoji = event.target.closest('[data-emoji]');
    if (emoji) insertEmoji(emoji.dataset.emoji || '');
  }

  function loadSession() {
    request('/me').then(function (data) {
      state.me = data.user;
      renderProfile();
      if (state.me && state.me.isAdmin) loadAdminComments();
    }).catch(function () {
      renderProfile();
    });
  }

  function loadComments() {
    var post = getPost();
    var list = state.root.querySelector('[data-role="comments-list"]');
    list.innerHTML = '<div class="comments-loading">正在加载评论…</div>';
    request('/comments?post=' + encodeURIComponent(post.path)).then(function (data) {
      state.comments = data.comments || [];
      renderComments();
    }).catch(function (error) {
      list.innerHTML = '';
      var empty = document.createElement('div');
      empty.className = 'comments-empty';
      empty.textContent = error.message || '评论暂时无法加载。';
      list.appendChild(empty);
      updateCommentCount(0);
    });
  }

  function renderProfile() {
    if (!state.root) return;
    var area = state.root.querySelector('[data-role="profile-area"]');
    var avatar = state.root.querySelector('[data-role="composer-avatar"]');
    area.replaceChildren();
    avatar.replaceChildren();

    if (state.me) {
      if (avatar.tagName !== 'IMG') {
        var image = document.createElement('img');
        avatar.replaceWith(image);
        avatar = image;
      }
      avatar.className = 'comment-avatar';
      avatar.removeAttribute('aria-hidden');
      avatar.alt = state.me.nickname + ' 的头像';
      avatar.src = state.me.avatarUrl;
      avatar.onerror = function () { showAvatarFallback(avatar, state.me.nickname); };
      var bar = document.createElement('div');
      bar.className = 'comment-user-bar';
      var description = document.createElement('span');
      description.append('登录为 ');
      var name = document.createElement('strong');
      name.textContent = state.me.nickname;
      description.appendChild(name);
      description.append(' · ' + maskEmail(state.me.email));
      var logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'comment-link-button';
      logout.textContent = '退出';
      logout.addEventListener('click', logoutUser);
      bar.append(description, logout);
      area.appendChild(bar);
      return;
    }

    showAvatarFallback(avatar, '评');
    var fields = document.createElement('div');
    fields.className = 'comment-profile-fields';
    fields.appendChild(createProfileField('昵称', 'nickname', '必填', true));
    fields.appendChild(createProfileField('邮箱', 'email', '必填', true, 'email'));
    fields.appendChild(createProfileField('网址', 'website', '选填', false, 'url'));
    area.appendChild(fields);
  }

  function createProfileField(labelText, name, placeholder, required, type) {
    var field = document.createElement('div');
    field.className = 'comment-field';
    var label = document.createElement('label');
    label.htmlFor = 'mistlane-comment-' + name;
    label.textContent = labelText;
    var input = document.createElement('input');
    input.id = 'mistlane-comment-' + name;
    input.name = name;
    input.placeholder = placeholder;
    input.autocomplete = name === 'email' ? 'email' : name === 'nickname' ? 'nickname' : 'url';
    input.type = type || 'text';
    input.required = Boolean(required);
    field.append(label, input);
    return field;
  }

  function submitComposer() {
    var content = contentInput().value.trim();
    if (!content) return setStatus('写点什么再发送吧。', 'error');
    if (state.me) return publishComment(content);

    var nickname = valueOf('nickname');
    var email = valueOf('email');
    var website = valueOf('website');
    if (!nickname || !email) return setStatus('请填写昵称和邮箱。', 'error');
    state.pendingComment = { nickname: nickname, email: email, website: website, content: content };
    state.codeSent = false;
    revealVerification();
    ensureTurnstile().then(function () {
      setStatus('请完成安全验证后发送验证码。');
    }).catch(function () {
      setStatus('安全验证加载失败，请检查网络后重试。', 'error');
    });
  }

  function revealVerification() {
    var panel = state.root.querySelector('[data-role="verification"]');
    panel.classList.add('is-visible');
    panel.querySelector('[data-role="verify-email"]').textContent = state.pendingComment.email;
  }

  function sendCode() {
    if (!state.pendingComment) return submitComposer();
    if (!state.turnstileToken) return setStatus('请先完成安全验证。', 'error');
    setBusy(true, '验证码发送中…');
    request('/auth/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.pendingComment.email,
        nickname: state.pendingComment.nickname,
        website: state.pendingComment.website,
        turnstileToken: state.turnstileToken
      })
    }).then(function () {
      state.codeSent = true;
      state.root.querySelector('[data-action="resend-code"]').textContent = '重新发送';
      setStatus('验证码已发送，请查收邮箱。', 'success');
      state.root.querySelector('[data-role="code"]').focus();
    }).catch(function (error) {
      setStatus(error.message || '验证码发送失败。', 'error');
      resetTurnstile();
    }).finally(function () {
      setBusy(false);
    });
  }

  function resendCode() {
    state.codeSent = false;
    resetTurnstile();
    ensureTurnstile().catch(function () {
      setStatus('安全验证加载失败，请稍后重试。', 'error');
    });
  }

  function verifyCode() {
    var code = state.root.querySelector('[data-role="code"]').value.trim();
    if (!state.pendingComment || !/^\d{6}$/.test(code)) return setStatus('请输入六位验证码。', 'error');
    setBusy(true, '正在验证邮箱…');
    request('/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingComment.email, code: code })
    }).then(function (data) {
      state.me = data.user;
      state.root.querySelector('[data-role="verification"]').classList.remove('is-visible');
      renderProfile();
      return publishComment(state.pendingComment.content);
    }).catch(function (error) {
      setStatus(error.message || '邮箱验证失败。', 'error');
    }).finally(function () {
      setBusy(false);
    });
  }

  function publishComment(content) {
    var post = getPost();
    setBusy(true, '评论发送中…');
    return request('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postPath: post.path,
        postTitle: post.title,
        postUrl: post.url,
        parentId: state.replyTo ? state.replyTo.id : null,
        content: content
      })
    }).then(function (data) {
      contentInput().value = '';
      updateCharacterCount();
      setReplyTarget(null);
      state.pendingComment = null;
      setStatus(data.comment && data.comment.status === 'pending' ? '评论已提交，等待审核。' : '评论已发布。', 'success');
      loadComments();
    }).catch(function (error) {
      setStatus(error.message || '评论发送失败。', 'error');
    }).finally(function () {
      setBusy(false);
    });
  }

  function logoutUser() {
    request('/auth/logout', { method: 'POST' }).then(function () {
      state.me = null;
      state.replyTo = null;
      renderProfile();
      setStatus('已退出登录。');
      loadComments();
    }).catch(function (error) {
      setStatus(error.message || '退出失败。', 'error');
    });
  }

  function renderComments() {
    var list = state.root.querySelector('[data-role="comments-list"]');
    list.replaceChildren();
    var visible = state.comments.filter(function (comment) {
      return !comment.parentId || !findComment(comment.parentId);
    });
    if (!visible.length) {
      var empty = document.createElement('div');
      empty.className = 'comments-empty';
      empty.textContent = '还没有评论，留下第一句话吧。';
      list.appendChild(empty);
    } else {
      visible.forEach(function (comment) { list.appendChild(renderComment(comment)); });
    }
    updateCommentCount(state.comments.filter(function (comment) { return !comment.deleted && comment.status === 'approved'; }).length);
  }

  function renderComment(comment) {
    var article = document.createElement('article');
    article.className = 'comment-item' + (comment.deleted ? ' is-deleted' : '');
    article.id = 'comment-' + comment.id;
    var head = document.createElement('div');
    head.className = 'comment-item__head';
    var avatar = document.createElement('img');
    avatar.className = 'comment-item__avatar';
    avatar.src = comment.author.avatarUrl;
    avatar.alt = comment.author.nickname + ' 的头像';
    avatar.onerror = function () { showAvatarFallback(avatar, comment.author.nickname, 'comment-item__avatar comment-avatar-fallback'); };
    var identity = document.createElement('div');
    identity.className = 'comment-item__identity';
    var author = document.createElement(comment.author.website ? 'a' : 'span');
    author.className = 'comment-item__author';
    author.textContent = comment.author.nickname;
    if (comment.author.website) {
      author.href = comment.author.website;
      author.target = '_blank';
      author.rel = 'nofollow noopener noreferrer';
    }
    identity.appendChild(author);
    if (comment.author.isAdmin) identity.appendChild(badge('博主', 'comment-owner-badge'));
    if (comment.status === 'pending') identity.appendChild(badge('审核中', 'comment-pending-badge'));
    var time = document.createElement('div');
    time.className = 'comment-item__time';
    time.textContent = formatTime(comment.createdAt);
    identity.appendChild(time);
    head.append(avatar, identity);

    var content = document.createElement('div');
    content.className = 'comment-item__content';
    content.textContent = comment.content;

    var actions = document.createElement('div');
    actions.className = 'comment-item__actions';
    if (!comment.deleted) {
      var reply = actionButton('回复', 'reply', comment.id);
      actions.appendChild(reply);
    }
    if (comment.canDelete) actions.appendChild(actionButton('删除', 'delete', comment.id));
    article.append(head, content, actions);

    var children = state.comments.filter(function (item) { return item.parentId === comment.id; });
    if (children.length) {
      var childWrap = document.createElement('div');
      childWrap.className = 'comment-children';
      children.forEach(function (child) { childWrap.appendChild(renderComment(child)); });
      article.appendChild(childWrap);
    }
    return article;
  }

  function loadAdminComments() {
    request('/admin/comments?status=pending').then(function (data) {
      var panel = state.root.querySelector('[data-role="admin"]');
      var list = state.root.querySelector('[data-role="admin-list"]');
      list.replaceChildren();
      (data.comments || []).forEach(function (comment) {
        var row = document.createElement('div');
        row.className = 'comment-user-bar';
        var text = document.createElement('span');
        text.textContent = comment.author.nickname + ' · ' + comment.content.slice(0, 60);
        var actions = document.createElement('span');
        actions.append(actionButton('通过', 'approve', comment.id), document.createTextNode(' '), actionButton('拒绝', 'reject', comment.id));
        row.append(text, actions);
        list.appendChild(row);
      });
      panel.hidden = !data.comments || data.comments.length === 0;
    });
  }

  function moderateComment(id, status) {
    request('/admin/comments/' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    }).then(function () {
      loadComments();
      loadAdminComments();
    }).catch(function (error) { setStatus(error.message || '审核操作失败。', 'error'); });
  }

  function deleteComment(id) {
    if (!window.confirm('确认删除这条评论？')) return;
    request('/comments/' + encodeURIComponent(id), { method: 'DELETE' }).then(function () {
      setStatus('评论已删除。', 'success');
      loadComments();
    }).catch(function (error) { setStatus(error.message || '删除失败。', 'error'); });
  }

  function setReplyTarget(comment) {
    state.replyTo = comment || null;
    var bar = state.root.querySelector('[data-role="reply-bar"]');
    bar.hidden = !state.replyTo;
    if (state.replyTo) {
      state.root.querySelector('[data-role="reply-name"]').textContent = state.replyTo.author.nickname;
      contentInput().focus();
    }
  }

  function togglePreview() {
    var preview = state.root.querySelector('[data-role="preview"]');
    preview.textContent = contentInput().value.trim() || '暂无预览内容。';
    preview.classList.toggle('is-visible');
  }

  function toggleEmojiMenu(button) {
    var menu = state.root.querySelector('[data-role="emoji-menu"]');
    state.emojiOpen = !state.emojiOpen;
    menu.classList.toggle('is-visible', state.emojiOpen);
    if (state.emojiOpen) {
      var composer = state.root.querySelector('.comment-composer');
      var composerRect = composer.getBoundingClientRect();
      var buttonRect = button.getBoundingClientRect();
      menu.style.left = (buttonRect.left - composerRect.left) + 'px';
      menu.style.bottom = (composerRect.bottom - buttonRect.top + 4) + 'px';
    }
  }

  function insertEmoji(emoji) {
    var input = contentInput();
    var start = input.selectionStart;
    var end = input.selectionEnd;
    input.setRangeText(emoji, start, end, 'end');
    input.focus();
    state.emojiOpen = false;
    state.root.querySelector('[data-role="emoji-menu"]').classList.remove('is-visible');
    updateCharacterCount();
  }

  function updateCharacterCount() {
    var value = contentInput().value.length;
    state.root.querySelector('[data-role="count"]').textContent = value + ' / 500';
  }

  function updateCommentCount(count) {
    state.root.querySelector('[data-role="comment-count-suffix"]').textContent = count ? ' · ' + count + ' 条' : '';
  }

  function setStatus(message, type) {
    var status = state.root.querySelector('[data-role="status"]');
    status.textContent = message || '';
    status.className = 'comment-status' + (type ? ' is-' + type : '');
  }

  function setBusy(busy, message) {
    var submit = state.root.querySelector('[data-role="submit"]');
    submit.disabled = busy;
    if (busy) setStatus(message || '处理中…');
  }

  function ensureTurnstile() {
    if (!siteKey) return Promise.reject(new Error('未配置 Turnstile site key'));
    if (window.turnstile) return renderTurnstile();
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-mistlane-turnstile]');
      if (existing) {
        existing.addEventListener('load', function () { renderTurnstile().then(resolve, reject); }, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.mistlaneTurnstile = 'true';
      script.onload = function () { renderTurnstile().then(resolve, reject); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function renderTurnstile() {
    return new Promise(function (resolve, reject) {
      try {
        var slot = state.root.querySelector('[data-role="turnstile"]');
        if (state.turnstileId !== null) return resolve();
        state.turnstileId = window.turnstile.render(slot, {
          sitekey: siteKey,
          appearance: 'interaction-only',
          callback: function (token) {
            state.turnstileToken = token;
            setStatus('安全验证完成，正在发送验证码…', 'success');
            if (state.pendingComment && !state.codeSent) sendCode();
          },
          'expired-callback': function () { state.turnstileToken = ''; },
          'error-callback': function () { state.turnstileToken = ''; setStatus('安全验证失败，请重试。', 'error'); }
        });
        resolve();
      } catch (error) { reject(error); }
    });
  }

  function resetTurnstile() {
    if (window.turnstile && state.turnstileId !== null) window.turnstile.reset(state.turnstileId);
    state.turnstileToken = '';
  }

  function findComment(id) {
    return state.comments.find(function (comment) { return comment.id === id; }) || null;
  }

  function contentInput() {
    return state.root.querySelector('[data-role="content"]');
  }

  function valueOf(name) {
    var input = state.root.querySelector('[name="' + name + '"]');
    return input ? input.value.trim() : '';
  }

  function actionButton(text, action, id) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.className = 'comment-link-button';
    button.dataset.action = action;
    button.dataset.commentId = id;
    return button;
  }

  function badge(text, className) {
    var element = document.createElement('span');
    element.className = className;
    element.textContent = text;
    return element;
  }

  function showAvatarFallback(element, nickname, className) {
    var fallback = document.createElement('span');
    fallback.className = className || 'comment-avatar-fallback';
    fallback.textContent = Array.from(nickname || '?')[0] || '?';
    element.replaceWith(fallback);
  }

  function maskEmail(email) {
    var parts = email.split('@');
    if (parts.length !== 2) return email;
    var local = parts[0] || '';
    return (local.slice(0, 2) || '*') + '***@' + parts[1];
  }

  function formatTime(timestamp) {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp * 1000));
  }

  function mountWhenVisible() {
    var mountPoint = document.querySelector('#post-comment .comment-wrap > div');
    if (!mountPoint || mountPoint.dataset.mistlaneCommentsMounted === 'true') return;

    if (!('IntersectionObserver' in window)) {
      mount();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      observer.disconnect();
      mount();
    }, { rootMargin: '320px 0px' });
    observer.observe(mountPoint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWhenVisible, { once: true });
  } else {
    mountWhenVisible();
  }
  document.addEventListener('pjax:complete', mountWhenVisible);
}());
