---
title: 将 Ubuntu 22.04 从 cgroup v2 切换到 cgroup v1 的完整配置教程
date: 2026-08-23 22:19:29
tags: 
  - 教程
  - ACM
  - 办赛
categories:
  - XCPC办赛
description: 解决Ubuntu 22.04存在的问题
cover: /images/少女.jpg
abbrlink: cgroup_v2_v1
---

# 将 Ubuntu 22.04 从 cgroup v2 切换到 cgroup v1 的完整配置教程

> **适用场景**：DOMjudge judgehost 启动时报错 `cannot create /sys/fs/cgroup/cgroup.subtree_control: Read-only file system` 或 `cgroup v2 not supported`

---

## 📌 前置说明

Ubuntu 22.04 **默认使用 cgroup v2**，但 DOMjudge 的 judgehost 组件依赖 **cgroup v1** 来隔离评测进程资源。因此需要强制系统启用 cgroup v1。

> ⚠️ **风险提示**：以下操作涉及修改系统引导配置，需**重启服务器**。建议在比赛部署前期完成，避免影响正常比赛。

---

## 🔍 第一步：确认当前 cgroup 版本

```bash
mount | grep cgroup
```

- 如果输出包含 `cgroup2`，说明当前使用 **cgroup v2**（需要修改）。
- 如果输出包含 `cgroup`（没有数字2），说明已经使用 **cgroup v1**（无需修改）。

也可以直接查看内核参数：

```bash
cat /proc/cmdline | grep systemd.unified_cgroup_hierarchy
```

- 如果输出包含 `systemd.unified_cgroup_hierarchy=0`，说明已启用 cgroup v1。
- 如果**没有输出**，说明当前是 cgroup v2。

---

## 📝 第二步：修改 GRUB 配置文件

### 2.1 编辑 `/etc/default/grub`

```bash
sudo nano /etc/default/grub
```

找到以下行：

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

将其**修改为**：

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=0"
```

保存退出（`Ctrl+O`，`Enter`，`Ctrl+X`）。

**参数说明**：

| 参数                                 | 作用                           |
| :----------------------------------- | :----------------------------- |
| `cgroup_enable=memory`               | 启用 cgroup 内存控制器         |
| `swapaccount=1`                      | 启用 swap 记账功能             |
| `systemd.unified_cgroup_hierarchy=0` | 强制使用 cgroup v1（最关键！） |

### 2.2 更新 GRUB 配置

```bash
sudo update-grub
```

必须看到类似以下输出才算成功：

```
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.8.0-...
Found initrd image: /boot/initrd.img-...
done
```

### 2.3 如果 `update-grub` 不生效（Azure UEFI 环境专用）

有些云服务器（尤其是 Azure）使用 UEFI 引导，`update-grub` 可能不会正确更新 UEFI 路径下的配置文件。此时需要手动检查并修改：

```bash
# 检查是否存在 UEFI 引导配置
ls /boot/efi/EFI/ubuntu/grub.cfg
```

如果该文件存在，需要同样修改它：

```bash
sudo nano /boot/efi/EFI/ubuntu/grub.cfg
```

找到 `linux /boot/vmlinuz-...` 行，在末尾添加同样参数，保存退出。

---

## 🔄 第三步：重启服务器

```bash
sudo reboot
```

等待约 2 分钟，系统重启完成。

---

## ✅ 第四步：验证修改是否生效

重新 SSH 连接后执行：

```bash
cat /proc/cmdline | grep systemd.unified_cgroup_hierarchy
```

**预期输出**：

```
systemd.unified_cgroup_hierarchy=0
```

同时验证 cgroup 挂载类型：

```bash
mount | grep cgroup
```

**预期输出**（应看到 `cgroup` 而非 `cgroup2`）：

```
cgroup on /sys/fs/cgroup type cgroup (rw,nosuid,nodev,noexec,relatime)
```

---

## 🧪 第五步：如果修改仍未生效（终极方案）

如果上述步骤执行后，`cat /proc/cmdline` 仍然没有 `systemd.unified_cgroup_hierarchy=0`，说明系统可能加载了其他位置的 GRUB 配置。此时可以**直接手动编辑 GRUB 引导文件**：

### 5.1 备份原文件

```bash
sudo cp /boot/grub/grub.cfg /boot/grub/grub.cfg.bak
```

### 5.2 编辑 grub.cfg

```bash
sudo nano /boot/grub/grub.cfg
```

找到**不带 `recovery mode`** 的正常启动条目中的 `linux /boot/vmlinuz-...` 行，在行末添加：

```
cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=0
```

**修改前示例**：

```
linux /boot/vmlinuz-6.8.0-1064-azure root=PARTUUID=xxx ro console=tty1 console=ttyS0 earlyprintk=ttyS0 nvme_core.io_timeout=240
```

**修改后示例**：

```
linux /boot/vmlinuz-6.8.0-1064-azure root=PARTUUID=xxx ro console=tty1 console=ttyS0 earlyprintk=ttyS0 nvme_core.io_timeout=240 cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=0
```

### 5.3 如果使用 UEFI 引导，还要修改 UEFI 路径下的文件

```bash
sudo nano /boot/efi/EFI/ubuntu/grub.cfg
```

同样找到 `linux /boot/vmlinuz-...` 行，添加相同参数。

### 5.4 重启

```bash
sudo reboot
```

---

## 📋 完整命令速查表

| 操作                   | 命令                                                         |
| :--------------------- | :----------------------------------------------------------- |
| 检查 cgroup 版本       | `mount \| grep cgroup`                                       |
| 检查内核参数           | `cat /proc/cmdline \| grep systemd.unified_cgroup_hierarchy` |
| 编辑 GRUB 配置         | `sudo nano /etc/default/grub`                                |
| 更新 GRUB              | `sudo update-grub`                                           |
| 手动编辑 grub.cfg      | `sudo nano /boot/grub/grub.cfg`                              |
| 手动编辑 UEFI grub.cfg | `sudo nano /boot/efi/EFI/ubuntu/grub.cfg`                    |
| 重启服务器             | `sudo reboot`                                                |

---

## ⚠️ 注意事项

1. **修改 `/boot/grub/grub.cfg` 是临时方案**：如果以后系统更新内核或执行 `update-grub`，这个文件会被重新生成，你的修改会丢失。建议让 `/etc/default/grub` 的修改生效才是根本解决方案。

2. **云服务器特殊环境**：Azure、AWS 等云平台可能使用自定义内核或特殊的引导方式，如果常规方法无效，建议：
   - 检查 Azure 门户中的 **自定义数据**（Custom Data）是否包含内核参数
   - 使用 **串行控制台** 手动传递内核参数

3. **最终备选方案**：如果无论如何都无法启用 cgroup v1，可以考虑：
   - 重装系统为 **Ubuntu 20.04**（默认 cgroup v1）
   - 使用 DOMjudge 8.3.1+ 版本并配置 cgroup v2 支持（不推荐新手）

---

## 🐛 踩坑记录：挂载为只读的问题

即使 cgroup v1 启用后，如果 Docker Compose 中 cgroup 挂载为**只读（`:ro`）**，judgehost 仍然会报错：

```
mkdir: cannot create directory '/sys/fs/cgroup/cpuset/domjudge': Read-only file system
```

**解决方案**：在 `docker-compose.yml` 中，将 judgehost 的 cgroup 挂载配置**去掉 `:ro`**：

```yaml
volumes:
  - /sys/fs/cgroup:/sys/fs/cgroup   # 正确（读写）
```

而不是：

```yaml
volumes:
  - /sys/fs/cgroup:/sys/fs/cgroup:ro   # 错误（只读）
```

---

## ✅ 验证 DOMjudge judgehost 正常运行

完成上述配置后，启动 judgehost，查看日志：

```bash
docker logs judgehost-0
```

**预期输出**应包含：

```
[ok] cgroups set up
[ok] Judge daemon started
```

如果看到类似输出，说明 cgroup 配置完全成功！🎉
