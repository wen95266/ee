# Termux 部署与 Telegram Bot 管理员配置全流程教程
# (Complete Android Termux Deployment & Telegram Bot Webhook Guide)

本教程专为在 Android 手机 **Termux** 终端中完整部署、拉取 GitHub 仓库、构建运行五大棋牌服务（斗地主、烟三、锄大地、十三水、国标麻将），以及配置 `.env` 文件、打通公网 HTTPS 穿透并启动 **Telegram Webhook 管理员机器人** 所编写。

---

## 目录
1. [前期准备：环境与工具](#一-前期准备环境与工具)
2. [第一步：将项目保存并推送到 GitHub 仓库](#二-第一步将项目保存并推送到-github-仓库)
3. [第二步：在 Termux 中拉取项目代码](#三-第二步在-termux-中拉取项目代码)
4. [第三步：安装依赖与构建生产环境](#四-第三步安装依赖与构建生产环境)
5. [第四步：创建 Telegram Bot 与配置 .env 文件](#五-第四步创建-telegram-bot-与配置-env-文件)
6. [第五步：配置公网 HTTPS 穿透（Webhook 必备）](#六-第五步配置公网-https-穿透webhook-必备)
7. [第六步：设置 Webhook 并启动 Telegram 机器人](#七-第六步设置-webhook-并启动-telegram-机器人)
8. [第七步：后台常驻运行与开机保活 (PM2)](#八-第七步后台常驻运行与开机保活-pm2)
9. [第八步：Telegram Bot 管理员指令实战操作](#九-第八步telegram-bot-管理员指令实战操作)
10. [第九步：多端访问与联机游玩](#十-第九步多端访问与联机游玩)
11. [常见问题排查与避坑指南 (FAQ)](#十一-常见问题排查与避坑指南-faq)

---

## 一、 前期准备：环境与工具

### 1. 手机端 Termux 软件版本要求
* **切勿使用 Google Play 商店的 Termux**（已停止维护多年，包管理器存在严重证书和安装错误）。
* **强烈建议从 F-Droid 或 GitHub Releases 下载最新版本**：
  * [F-Droid Termux 下载页](https://f-droid.org/packages/com.termux/)
  * [Termux 官方 GitHub Releases](https://github.com/termux/termux-app/releases)

### 2. 准备材料
* 一个 **GitHub 账号**（用于存放代码并从手机克隆）。
* 一个 **Telegram 账号**（用于创建与操控管理员机器人）。
* 一部 Android 手机（需支持后台运行与 Wi-Fi / 蜂窝网络）。

---

## 二、 第一步：将项目保存并推送到 GitHub 仓库

如果你在电脑或当前开发环境中，请按照以下步骤将所有源码推送到你的 GitHub 仓库：

### 1. 检查 `.gitignore`
确保项目根目录的 `.gitignore` 包含了敏感文件，**不要将本地密钥 `.env` 提交到公开仓库**：
```gitignore
node_modules
dist
.env
*.log
```

### 2. 初始化 Git 并推送到远程
在项目根目录下依次执行：

```bash
# 1. 初始化本地仓库 (如果尚未初始化)
git init

# 2. 添加所有项目文件
git add .

# 3. 提交本地版本
git commit -m "feat: complete card games, termux engine, and telegram bot integration"

# 4. 设定主分支为 main
git branch -M main

# 5. 关联你的 GitHub 远程仓库 (替换为你自己的仓库地址)
git remote add origin https://github.com/你的GitHub用户名/你的仓库名.git

# 6. 推送至 GitHub
git push -u origin main
```

---

## 三、 第二步：在 Termux 中拉取项目代码

打开手机上的 **Termux** 应用。

### 1. 更新 Termux 系统软件源并安装基础环境
复制并粘贴以下整行命令运行：

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts python clang make pkg-config curl jq nano -y
```

检查 Node.js 与 npm 是否正常就绪：
```bash
node -v   # 建议 Node.js 18.x 或 20.x+
npm -v
git --version
```

### 2. 克隆你的 GitHub 仓库
```bash
# 切换到主目录
cd ~

# 克隆你的仓库 (替换为你实际的 GitHub 仓库地址)
git clone https://github.com/你的GitHub用户名/你的仓库名.git

# 进入项目目录
cd 你的仓库名
```

---

## 四、 第三步：安装依赖（免手机编译，开箱即用）

### 1. 安装 npm 项目运行依赖
在项目根目录下执行：
```bash
npm install
```

> **小技巧（国内网络加速）**：若在手机上安装速度慢或遇到网络超时，可先切换至淘宝镜像源：
> ```bash
> npm config set registry https://registry.npmmirror.com
> npm install
> ```

### 2. 关于前端构建（为什么手机上无需执行 `npm run build`？）
> **⚠️ 重要注意（解决 Segmentation fault 核心）**：
> * Android 手机的 Termux 使用的是 **Android Bionic C 库**，而非 PC/Linux 标准的 `glibc`。
> * Vite 及底层打包引擎（Rollup、esbuild、Tailwind v4 Oxide）依赖了编译针对标准 glibc 的 C/Rust 动态库。**在手机 Termux 上直接执行 `npm run build` 会触发系统底层的 `Segmentation fault`（段错误闪退）**。
> * **优雅解决方案**：本项目已在 `.gitignore` 中解除对 `dist` 的忽略，**完整的生产静态文件 `dist/` 已预先打包并随代码一同提交在 GitHub 仓库中**！
> * 因此，在手机 Termux 端克隆或拉取仓库后，**完全不需要执行 `npm run build`**，安装好依赖后即可直接启动服务！
> * （后续如果修改了 Vue 前端代码，只需在电脑或开发端运行一次 `npm run build` 并 `git push` 到仓库，手机端 `git pull` 即可自动同步更新！）

---

## 五、 第四步：创建 Telegram Bot 与配置 .env 文件

### 1. 在 Telegram 获取 Bot Token
1. 在 Telegram 中搜索官方机器人之父：`@BotFather`。
2. 发送指令 `/start`，然后发送 `/newbot`。
3. 根据提示输入你的机器人名称（例如：`MyTeaChessBot`）。
4. 输入你的机器人用户名，必须以 `bot` 结尾（例如：`my_tea_chess_bot`）。
5. 创建成功后，@BotFather 会返回一段 **HTTP API Token**（形如 `7123456789:AAHk2AbcDefGhIjklmnOPQRSTUvwxYZ`）。请复制并妥善保管。

### 2. 在 Termux 中创建并编辑 `.env`（支持上级根目录安全隔离）

> **💡 最佳安全实践（防止后续 git pull 覆盖配置）**：
> 系统底层已配置了**智能多级路径检索**，自动支持在当前项目目录 `.env` 以及**上一级目录（即 Termux 用户主目录 `~/.env` 或 `../.env`）**读取环境变量！
> 将 `.env` 放在上一级 Termux 根目录，后续无论在仓库中执行多少次 `git pull`、`git checkout` 或更新，都**绝对不会覆盖、冲突或泄露您的真实 Token 和密码**！

#### 推荐方式：直接创建在 Termux 根目录 (`~/.env`)
在项目根目录中，直接将模板复制到上一级用户主目录：
```bash
# 复制模板到 Termux 主目录 ~/.env (即 ../.env)
cp .env.example ~/.env

# 使用 nano 编辑保存在主目录的 .env
nano ~/.env
```

*(可选常规方式：如果习惯存放在当前项目内，也可直接运行 `cp .env.example .env && nano .env`，二者系统均可自动秒级识别加载)*

`.env` 文件内容配置模板与各项含义：
```env
# ==========================================
# 茶楼棋牌系统环境变量配置 (位于 ~/.env 或 ../.env)
# ==========================================

# 1. 公网访问域名 (Telegram 官方 Webhook 强制要求 HTTPS 地址，末尾切勿加斜杠)
# 在下一步通过 Cloudflare Tunnel 或穿透工具获得后填入，例如：
APP_URL="https://your-domain-or-cf-tunnel.trycloudflare.com"

# 2. 从 @BotFather 获取的 Telegram Bot Token
TELEGRAM_BOT_TOKEN="7123456789:AAHk2AbcDefGhIjklmnOPQRSTUvwxYZ"

# 3. 超级管理员手机号 (注册该手机号直接拥有游戏内【👑 超级管理员】特权)
TELEGRAM_ADMIN_PHONE="13800138000"

# 4. 允许注册的手机号白名单 (逗号分隔，只有在名单内的手机号才能注册进入游戏)
TELEGRAM_AUTHORIZED_PHONES="13800138000,13900139000,13700137000"

# 5. 管理员 Telegram 用户名 (无需 @ 符号，逗号分隔)
TELEGRAM_ADMIN_USERNAMES="你的Telegram用户名"
```

> **nano 编辑器操作提示**：
> * 修改完成后，按下 `Ctrl + O`，回车保存。
> * 按下 `Ctrl + X` 退出编辑器。

---

## 六、 第五步：配置公网 HTTPS 穿透（Webhook 必备）

> **为什么必须要有公网 HTTPS？**
> Telegram 官方服务器向你的机器人推送 Webhook 时，**强制要求公网且具有合法 SSL 证书的 HTTPS URL**。手机在家庭局域网下的 `192.168.x.x` 或纯 HTTP 无法被 Telegram 官方服务器直连。

### 推荐方案：使用 Cloudflare Tunnel (免费、免备案、自带全球 HTTPS)

Termux 官方源中已原生收录了 `cloudflared`，完全免配置即可使用！

1. **在 Termux 中安装 cloudflared**：
   ```bash
   pkg install cloudflared -y
   ```

2. **新建一个 Termux 会话窗口或后台运行穿透**：
   （在 Termux 界面从左边缘向右滑动，点击 `New Session` 打开第二个终端窗口）：
   ```bash
   cloudflared tunnel --url http://localhost:8080
   ```

3. **获取临时 HTTPS 域名**：
   运行后，终端日志中会打印一行类似：
   ```
   https://random-words-subdomain.trycloudflare.com
   ```
   这个带有 `https://` 的地址就是你的专属公网域名！

4. **更新 `.env` 中的 `APP_URL`**：
   将该域名填入 `.env` 的 `APP_URL` 字段中：
   ```env
   APP_URL="https://random-words-subdomain.trycloudflare.com"
   ```

---

## 七、 第六步：设置 Webhook 并启动 Telegram 机器人

本系统内置了自动化的 Webhook 注册接口，支持两种简单配置方式：

### 方式一：通过项目内置接口一键绑定（最简便）
当服务启动且穿透域名配置到 `.env` 后，在手机浏览器直接打开：
```
https://<你的穿透域名>/api/telegram/set-webhook
```
或者在 Termux 中执行 curl：
```bash
curl -X POST http://localhost:8080/api/telegram/set-webhook
```
若返回 `{"success":true,"configuredWebhookUrl":"..."}`，说明 Telegram 官方已经成功将你的机器人与服务器 Webhook 挂钩！

---

### 方式二：使用官方标准 curl 指令向 Telegram 注册
在 Termux 中运行以下命令（将 `<BOT_TOKEN>` 与 `<你的穿透域名>` 替换为实际值）：
```bash
curl -F "url=https://<你的穿透域名>/api/telegram/webhook" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```
成功后，Telegram 官方会返回响应：
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 验证 Webhook 当前运行状态
在 Termux 中运行：
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo | jq .
```
如果 `url` 正确显示为你的穿透地址，且 `has_custom_certificate` 和 `pending_update_count` 状态正常，即代表 Webhook 全面生效！

---

## 八、 第七步：后台常驻运行与开机保活 (PM2)

为了防止退出 Termux 或切换到其他应用时服务被系统休眠杀死，请开启后台守护。

### 1. 开启 Termux 唤醒锁与电池无限制优化
1. 在 Termux 中执行以下指令，保持 CPU 处于活跃唤醒状态：
   ```bash
   termux-wake-lock
   ```
2. 在手机系统设置中：
   * 进入【应用管理】-> 找到【Termux】。
   * 【电池 / 省电策略】设置为：**无限制 / 允许完全后台活动**。
   * 【自启动管理】勾选：**允许后台常驻与自启动**。

### 2. 使用 PM2 守护常驻启动服务
1. **安装 PM2**：
   ```bash
   npm install -g pm2
   ```

2. **通过 PM2 启动主服务**：
   ```bash
   pm2 start npm --name "tea-chess" -- run start
   ```

3. **使用 PM2 同时守护 Cloudflare 穿透（可选）**：
   ```bash
   pm2 start "cloudflared tunnel --url http://localhost:8080" --name "tunnel"
   ```

4. **查看运行状态与实时日志**：
   ```bash
   # 查看当前运行的服务列表
   pm2 status

   # 实时监控游戏服务器日志与 Telegram 机器人指令响应
   pm2 logs tea-chess

   # 重启游戏服务
   pm2 restart tea-chess

   # 停止游戏服务
   pm2 stop tea-chess
   ```

---

## 九、 第八步：Telegram Bot 管理员指令实战操作

现在打开你的 Telegram，搜索你的 Bot 并点击 **Start**，或者直接向 Bot 发送消息。

### 可用管理员指令一览表：

| 指令 | 参数格式 | 说明 |
| :--- | :--- | :--- |
| `/start` 或 `/help` | 无 | 获取 Telegram 机器人管理员操作中枢帮助菜单 |
| `/users` | 无 | 查看所有已注册茶客列表、UID、绑定手机号与筹码余额 |
| `/addpoints` | `<手机号/UID> <数量>` | 为指定玩家充值增加筹码（如 `/addpoints 13800138000 10000`） |
| `/subpoints` | `<手机号/UID> <数量>` | 扣除指定玩家筹码（如 `/subpoints 13800138000 2000`） |
| `/setpoints` | `<手机号/UID> <数量>` | 直接将玩家筹码重设为固定数值（如 `/setpoints 13800138000 88888`） |
| `/authphone` | `<手机号>` | 动态将手机号加入注册授权白名单（如 `/authphone 13912345678`） |
| `/ban` | `<手机号/UID> [封禁原因]` | 立即封禁违规账号，踢下线并禁止登录 |
| `/unban` | `<手机号/UID>` | 解除账号封禁，恢复正常游玩资格 |
| `/broadcast` | `<通告消息内容>` | 实时向全服所有对战房间（斗地主/烟三/锄大地等）桌面推送滚动广播 |
| `/stats` | 无 | 查询茶楼全局运营数据（总人数、筹码总池、白名单数、运行状态） |

### 实战演示：
1. **测试帮助菜单**：
   向 Bot 发送：`/help`
   Bot 立即回复完整的指令操作指南。
2. **向全服各桌牌友喊话**：
   向 Bot 发送：`/broadcast 今晚八点雀神争霸赛正式打响，准时开打！`
   所有在线对战房间的牌桌顶部立即弹出发信人为“📢 Telegram 广播”的全局通告。
3. **给指定手机号充值**：
   向 Bot 发送：`/addpoints 13800138000 50000`
   Bot 立即回复：“✅ 成功为 本家 (13800138000) 注入筹码 +50000 贯！当前持有: 58888 贯”。

---

## 十、 第九步：多端访问与联机游玩

### 1. 手机本地浏览器畅玩
在部署了 Termux 的手机上，打开任意浏览器（Chrome / Via / Edge 等）：
* 输入地址：`http://localhost:8080`
* 点击浏览器菜单中的 **【添加到主屏幕】**，即可生成类似独立 App 的全屏 PWA 体验。

### 2. 局域网同 Wi-Fi 联机
朋友与你在同一个 Wi-Fi 或手机热点下：
1. 在 Termux 中输入 `ifconfig` 查看 `wlan0` 的内网 IP（例如 `192.168.1.108`）。
2. 朋友在手机浏览器中输入：`http://192.168.1.108:8080`，即可同服进房对战！

### 3. 远程公网联机
使用前面通过 Cloudflare Tunnel 或穿透工具获得的 HTTPS 地址（例如 `https://xxxx.trycloudflare.com`），世界各地的牌友输入该网址即可秒级进入对战大厅。

---

## 十一、 常见问题排查与避坑指南 (FAQ)

### Q1: 在 Telegram 向 Bot 发送消息，Bot 没有回复？
1. **检查 Webhook 是否绑定成功**：
   运行 `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`，查看是否有 `last_error_message`。
2. **检查穿透域名是否失效**：
   如果重新运行了 `cloudflared`，临时域名可能已变更，请同步更新 `.env` 中的 `APP_URL` 并重新设置 Webhook。
3. **查看 PM2 日志**：
   在 Termux 运行 `pm2 logs tea-chess`，观察是否有收到 `/api/telegram/webhook` 的 POST 请求与报错。

### Q2: 手机息屏或过夜后，服务断开连接？
1. 确保已在 Termux 中执行了 `termux-wake-lock`（顶部通知栏会显示 "Termux - wake lock held"）。
2. 在手机系统设置中，确保已将 Termux 加入**电池无限制白名单**，并开启**允许后台自启动**。

### Q3: 运行 `npm run build` 时手机卡顿或内存不足 (OOM)？
* Android 手机若物理运存较小，可以设置 Node 内存上限：
  ```bash
  export NODE_OPTIONS="--max-old-space-size=1024"
  npm run build
  ```

### Q4: 提示 8080 端口被占用？
* 查看占用 8080 端口的进程并关闭：
  ```bash
  fuser -k 8080/tcp
  # 或使用 pm2 重启
  pm2 restart tea-chess
  ```

### Q5: 如何拉取 GitHub 上的最新更新？
当你在 GitHub 提交了新代码，只需在 Termux 的项目目录执行：
```bash
cd ~/你的仓库名
git pull origin main
npm install
npm run build
pm2 restart tea-chess
```
即可平滑热更新服务！
