---
abbrlink: Learning about HTML
tags:
  - 前端
  - 知识学习
  - 总结
title: HTML知识学习
categories:
  - 教程
cover: /images/selection3.jpg
description: 关于html的基本知识
date: 2026-07-31 20:43:11
---


## 框架

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

vsc快捷键：！+“回车” 唤起框架

解释：

**HTML5的DOCTYPE声明**

DOCTYPE是document type （文档类型）的缩写。<!DOCTYPE html>是H5的声明位于文档的最前面，处于标签之前。是网页必备的组成部分，避免浏览器的怪异模式。

---

**head 标签**

head 标签用于定义文档的头部。文档的头部描述了文档的各种属性和信息，包括文档的标题、在 Web 中的位置以及其他文档的关系等。绝大多数文档头部包含的数据都不会真正作为内容显示给读者。

---

**body 标签**

body 元素定义文档的主体。

body 元素包含文档的所有内容（比如文本、超链接、图像、表格和列表等等）。

它会直接在页面中显示出来，也就是用户可以直观看到的内容。

---

**title 标签**

1. 可定义文档的标题。
2. 它显示在浏览器窗口的标题栏或状态栏上。
3. `<title>` 标签是 `<head>` 标签中唯一必须要求包含的东西，就是说写 head 一定要写 title。
4. `<title>` 的增加有利于 SEO 优化。

> SEO 是搜索引擎优化的英文缩写。通过对网站内容调整，满足搜索引擎的排名需求。

---

**meta 标签**

meta 标签用来描述一个 HTML 网页文档的属性、关键词等，例如：`charset="utf-8"` 是说当前使用的是 utf-8 编码格式，在开发中我们经常会看到 utf-8，或是 gbk，这些都是编码格式，通常使用 utf-8。

## 常用标签:

换行标签：`<br>`

水平分割线：`<hr>`

### 标题标签:

h1~h6      `<h1>一级标题</h1>`

标题标签位置摆放

在标签中添加属性：`align="left | center | right"`，默认居左。

```html
<h1 align="left">一级标题</h1>
<h2 align="center">二级标题</h2>
<h3 align="right">三级标题</h3>
```

请确保将 `HTML` 标题标签只用于标题。

不要仅仅是为了生成粗体或大号的文本而使用标题。

正确使用标题有益于 SEO。

应该将 `<h1>` 用作主标题（最重要的），其后是 `<h2>`（次重要的），再其次是 `<h3>`，以此类推。

### 段落标签：

​            `<p>段落</p>`

加粗：	   `<b>加粗</b>`

斜体:			`<i>斜体</i>`

下划线：	`<u>下划线</u>`

删除线：	`<s>删除线</s>`

## 水平线

`<hr>` 标签在 HTML 页面中创建水平线。

基本语法：`<hr color="..." width="..." size="..." align="..." />`

**属性：**

1. **color**：设置水平线的颜色  
2. **width**：设置水平线的长度  
3. **size**：设置水平线的高度  
4. **align**：设置水平线的对齐方式（默认居中），可取值 `left` 或 `right`

## 无序列表：

无序列表是一个项目的列表，此列项目使用粗体圆点（典型的小黑圆圈）进行标记。

无序列表始于 `<ul>` 标签。每个列表项始于 `<li>` 标签。

`<ul>`

​    `<li>无序列表 1</li>`

​    `<li>无序列表 2</li>`

  `</ul>`

### type属性

`<ul>` 的属性type 拥有的选项

- disc 默认实心圆  
- circle 空心圆  
- square 小方块  
- none 不显示

> 快速生成 ul + li 的布局（Emmet 语法）：ul>li*3
>



## 有序列表：

有序列表是一列项目，列表项目使用数字进行标记。有序列表始于 `<ol>` 标签。每个列表项始于 `<li>` 标签。

`<ol>`

​    `<li>有序列表 1</li>`

​    `<li>有序列表 2</li>`

  `</ol>`

### type 属性

`<ol>` 的 `type` 属性拥有的选项：

1. `1` — 表示列表项目用数字标号（1, 2, 3...）  
2. `a` — 表示列表项目用小写字母标号（a, b, c...）  
3. `A` — 表示列表项目用大写字母标号（A, B, C...）  
4. `i` — 表示列表项目用小写罗马数字标号（i, ii, iii...）  
5. `I` — 表示列表项目用大写罗马数字标号（I, II, III...）

列表是可以嵌套的

## 表格标签：

表格组成与特点

- 行、列、单元格
- 单元格特点：同行等高、同列等宽。

表格标签

- 表格：`<table>`
- 行：`<tr>`
- 单元格（列）：`<td>`

```html
<table>
        <tr>
            <th>列标题1</th>
            <th>列标题2</th>
        </tr>
        <tr>
            <td>元素1</td>
            <td>元素2</td>
        </tr>
        <tr>
            <td>元素3</td>
            <td>元素4</td>
        </tr>
    </table>
```

> 快速生成表格结构（Emmet 语法） table>tr*2>td{单元格}

表格属性

1. **border**：设置表格的边框  
2. **width**：设置表格的宽度  
3. **height**：设置表格的高度

合并单元格

以坐上为基准 是td的属性

- 水平合并 colspan

- 垂直合并 rowspan

```html
<table>
    <tr>
        <td colspan=2 rowspan=2>合并2*2的方格 </td>
    </tr>
    	...
    <tr>
    </tr>
</table>
```



## HTML标签属性：

基本语法：

```html
<开始标签 属性名=“属性值”>
```

适用于大多数HTML的标签属性:

|  属性  | 描述                                             |
| :----: | ------------------------------------------------ |
| class  | 为HTML元素定义一个或多个类名(类名从样式文件引入) |
|   id   | 定义元素唯一的id                                 |
| stytle | 规定元素的行内样式                               |

## 链接标签:

超链接属性

在标签 `<a>` 中使用了 `href` 属性来描述链接的地址。

默认情况下，链接将以以下形式出现在浏览器中：

1. 一个未访问过的链接显示为蓝色字体并带有下划线。
2. 访问过的链接显示为紫色并带有下划线。
3. 点击链接时，链接显示为红色并带有下划线。

---

> 特别提示：
>
> 后期我们会通过 CSS 样式修改掉这些效果。

helf表示链接地址

target表示打开方式

这是我的博客链接这个可以是任何的格式，比如图片标签

```html
<a href="https://mistlane.cc.cd/">这是我的博客链接</a>
<a href="https://mistlane.cc.cd/" target="_blank">这是我的博客链接</a>
<a href="https://mistlane.cc.cd/" target="_parent">这是我的博客链接</a>
<a href="https://mistlane.cc.cd/" target="_self">这是我的博客链接</a>
<a href="https://mistlane.cc.cd/" target="_top">这是我的博客链接</a>
```

## 图片标签:

`<img src="" alt="" width="" height="">`

**注意:**`<img>` 是单标签，不需要进行闭合操作。

**属性**

1. **src**：路径（图片地址与名字）（绝对路径，相对路径，网络链接）
2. **alt**：规定图像的替代文本（图片无法显示时的文本）
3. **width**：规定图像的宽度
4. **height**：规定图像的高度
5. **title**：鼠标悬停在图片上给予提示

## 常用文本标签

| 标签       | 描述               |
| ---------- | ------------------ |
| `<em>`     | 定义着重文字       |
| `<b>`      | 定义粗体文本       |
| `<i>`      | 定义斜体字         |
| `<strong>` | 定义加重语气       |
| `<del>`    | 定义删除字         |
| `<span>`   | 元素没有特定的含义 |

---

> 特别提示
>
> 常用文本标签和段落是不同的，段落代表一段文本，而文本标签一般表示文本词汇。

## 块元素和行内元素

块元素会独占一行

行内元素会紧跟在上个元素之后

div标签：将内容分块    `<div>    </div>`

span标签：文本内联化（好高级啊）	`<span>	</span>`



## From表单

让表单具有交互性

实现带有输入性质的一个模块

表单是由容器和控件组成的，一个表单一般应该包含用户填写信息的输入框，提交按钮等，这些输入框、按钮叫做控件，表单就是容器，它能够容纳各种各样的控件

```html
<form action="url" method="get|post" name="myform"></form>
```

### 属性说明

- **action**：服务器地址（即提交表单数据的目标URL）
- **name**：表单名称（用于标识该表单）

> method 中 Get 和 Post 的区别

1. **数据提交方式**：GET 方式提交的数据会在 URL 中可见，POST 方式提交的数据在 URL 中不可见。
2. **数据量大小**：GET 一般用于提交少量数据，POST 用来提交大量数据。

### 表单元素

#### 文本框

文本域通过 `<input type="text">` 标签来设定，当用户要在表单中键入字母、数字等内容时，就会用到文本域。

示例代码：

```html
<form>
    First name: <input type="text" name="firstname">
    <br>
    Last name: <input type="text" name="lastname">
</form>
```



显示效果：

<form>
    First name: <input type="text" name="firstname">
    <br>
    Last name: <input type="text" name="lastname">
</form>

#### 密码框

密码字段通过 `<input type="password">` 标签来定义。

示例代码：

```html
<form>
    Password: <input type="password" name="pwd">
</form>
```



显示效果（输入内容会以圆点或星号掩码显示）：

<form>
    Password: <input type="password" name="pwd">
</form>

#### 提交按钮

当用户单击确认按钮时，表单的内容会被传送到另一个文件。表单的**动作属性**（`action`）定义了目的文件的文件名。由动作属性定义的这个文件通常会对接收到的输入数据进行相关的处理。

示例代码：

```html
<form name="input" action="url" method="get">
    <p>
    Username: <input type="text" name="user">
    <input type="submit" value="Submit">
    </p>
</form>
```

显示效果（示意）：

<form name="input" action="url" method="get">
    <p>
    Username: <input type="text" name="user">
    <input type="submit" value="Submit">
    </p>
</form>



```html
</form>
    <form action="#"> //action对应的是提交后传入的地址
        <label for="1">姓名</label>
        <input type="text" placeholder="请输入姓名" id="1">
        //label中的for对应input中的id
        //input type="text" 输入文本 type="radio" 单选 同一个选项name属性是相同的
        //type="checkbox" 多选
        <input type="submit"> //总的提交按钮,最终提交的地址由总的action决定
       	
    </form>

```

## 块元素与行内元素(内联元素)

| 块级元素                                     | 内联元素                                     |
| :------------------------------------------- | :------------------------------------------- |
| 块元素会在页面中独占一行（自上向下垂直排列） | 行内元素不会独占页面中的一行，只占自身的大小 |
| 可以设置 `width`、`height` 属性              | 行内元素设置 `width`、`height` 属性无效      |
| 一般块级元素可以包含行内元素和其他块级元素   | 一般内联元素包含内联元素不包含块级元素       |

**常见块级元素**：
`div`、`form`、`h1~h6`、`hr`、`p`、`table`、`ul` 等

**常见内联元素**：
`a`、`b`、`em`、`i`、`span`、`strong` 等

**行内块级元素（特点：不换行、能够识别宽高）**
`button`、`img`、`input` 等

## HTML5新增标签

### 传统 div 布局

```html
<div id="header"></div>
<div id="nav"></div>
<div id="article">
    <div id="section"></div>
</div>
<div id="silder"></div>
<div id="footer"></div>
```



### HTML5 语义化标签布局

```html
<header></header>
<nav></nav>
<article>
    <section></section>
</article>
<aside></aside>
<footer></footer>
```

H5 新标签

1. `<header></header>` —— 头部
2. `<nav></nav>` —— 导航
3. `<section></section>` —— 定义文档中的节，比如章节、页眉、页脚
4. `<aside></aside>` —— 侧边栏
5. `<footer></footer>` —— 脚部
6. `<article></article>` —— 代表一个独立的、完整的相关内容块，例如一篇完整的论坛帖子、一篇博客文章、一个用户评论等

# 拓展知识

## div 容器元素

`div` 是页面中见到的最多的元素，通常用作布局容器。

**div 实现示例**（示意结构）：
![[div结构.png]]

## 路径详解

**绝对路径**

绝对路径是电脑的盘符存储与访问的具体地址。

示例：`E:\itbaizhanCode\1.jpg`

---

**相对路径**

相对路径是指**相对于当前文件所在目录**的路径。它不依赖于根目录，而是根据当前文件的位置来定位目标资源。

常见的相对关系有三种：

1. **同级关系**（同一目录）  
   目标文件与当前文件在同一个文件夹内，直接写文件名即可。  
   示例：`<img src="photo.jpg">` 或 `./photo.jpg`（`./` 表示当前目录，可省略）

2. **子级关系**（当前目录的下级文件夹）  
   目标文件在当前文件夹的某个子文件夹内，需要写上文件夹名称和文件名。  
   示例：`<img src="images/photo.jpg">` 或 `./images/photo.jpg`

3. **父级关系**（上级目录）  
   目标文件在当前文件夹的上一层（或上多层）目录中，使用 `../` 表示上一级目录，可连续使用。  
   示例：`<img src="../photo.jpg">`（上一级），`<img src="../../photo.jpg">`（上两级）

> 相对路径的优势在于：当整个项目文件夹移动位置时，只要内部相对结构不变，路径依然有效，便于移植。

---

**网络路径**

具体的网络地址（URL），直接引用互联网上的资源。

示例：  
[http://iwenwiki.com/api/newworld/images/n1.png](http://iwenwiki.com/api/newworld/images/n1.png)
