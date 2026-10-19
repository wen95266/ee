# 游戏源码结构与文件说明 (Game Files Description)

本项目包含多款经典棋牌与桌游（斗地主、锄大地、十三水、麻将、氡三等）。以下是各游戏的**规则引擎文件（Rules Engine）**与**界面/交互组件文件（UI Components & Canvas）**的详细说明。

---

## 一、 各游戏规则引擎文件 (Rules & Logic Engines)
存放于 `/src/engine/` 目录下，负责处理牌型判断、出牌合法性验证、得分计算、胜负判定与洗牌/发牌逻辑。

1. **斗地主规则文件**：
   - `src/engine/doudizhuRules.ts`
   - **说明**：定义了斗地主的牌型识别（单张、对子、顺子、飞机、炸弹、王炸等）、大小比较、出牌规则以及不洗牌场/经典场的发牌及倍数计分逻辑。

2. **锄大地规则文件**：
   - `src/engine/chudadiRules.ts`
   - **说明**：实现了正统经典锄大地（Big Two）的牌型规则（单、对、三条、顺子、同花、葫芦、四带一、同花顺）、黑桃2全场至尊、首局方块3先出、全场绝大无牌可压出牌权连出判定、剩余手牌数倍数放大（如8-9张翻2倍、10-12张翻3倍、13张未出翻4倍）以及满100分结算与四舍五入赢分差计算。

3. **十三水规则文件**：
   - `src/engine/shisanshuiRules.ts`
   - **说明**：十三水（Chinese Poker）的牌型组合（头墩3张、中墩5张、尾墩5张），倒水判定、牌型大小比较及全垒打/打枪计分逻辑。

4. **广东麻将 / 麻将规则文件**：
   - `src/engine/mahjongRules.ts`
   - **说明**：麻将胡牌牌型判断、番数计算、碰杠吃与摸牌逻辑。

5. **氡三（氡三麻将/棋牌）规则文件**：
   - `src/engine/yansanRules.ts`
   - **说明**：氡三特色玩法规则与计分引擎。

6. **全局游戏状态与通用类型定义**：
   - `src/engine/gameStateTypes.ts`
   - **说明**：定义了所有游戏通用的房间状态、玩家结构、游戏类型枚举 (`GameType`) 及动作交互接口。

---

## 二、 界面与视图组件文件 (UI Components & Canvas Views)
存放于 `/src/components/` 及其子目录下，负责渲染游戏舞台、动画特效、操作按钮、积分面板及场景选择。

1. **全局主入口与视图调度**：
   - `src/App.vue`
   - **说明**：主控组件。负责大厅导航、各个游戏模式的路由切换、全局音效控制、主题切换以及弹窗调度。

2. **游戏舞台画布组件 (Canvas Views)**：
   存放于 `/src/components/canvas/`：
   - `DoudizhuCanvas.vue`：斗地主游戏主舞台（支持经典场与不洗牌场切换、叫地主、出牌动画、十字计分等）。
   - `ChudadiCanvas.vue`：锄大地游戏主舞台（左下角十字布局统计累计手牌剩余数、倍数计算与结算弹窗）。
   - `ShisanshuiCanvas.vue`：十三水游戏舞台（摆牌、比牌动画）。
   - `MahjongCanvas.vue`：麻将游戏舞台（摸牌、打牌、碰杠胡动画）。
   - `YansanCanvas.vue`：氡三游戏舞台。

3. **场景选择弹窗组件 (Scene Selection Modals)**：
   - `DoudizhuSceneModal.vue`：斗地主场次选择（经典场 vs 不洗牌场）。
   - `MahjongSceneModal.vue`：麻将场次选择。
   - `ShisanshuiSceneModal.vue`：十三水场次选择。

4. **系统与功能弹窗组件**：
   - `AuthModal.vue`：用户登录/注册弹窗。
   - `UserProfileModal.vue`：用户个人资料与战绩统计。
   - `PointsManageModal.vue`：积分与资产管理。
    - `AchievementModal.vue`：成就系统弹窗。
    - `TermuxDeploySection.vue`：Termux 部署教程及指引组件（包含一键部署脚本、Rust WS服务源码、Cargo配置及 Android APK 自动化打包工作流查看与下载）。
    - `ApkDownloadModal.vue`：Android APK 客户端极速下载弹窗（内置 GHProxy、GitMirror、KKGitHub 等多条国内高速免翻墙直链，支持一键复制与即刻下载）。

---

## 三、 Android APK 自动化构建与国内加速下载 (GitHub Actions CI/CD)
- `.github/workflows/build-apk.yml`：
  - **功能**：监听仓库 `main` / `master` 分支推送。一旦代码发生更新，自动安装依赖、执行 `npm run build`、同步 Capacitor Android 原生工程，并通过 Gradle 自动编译出 Release 正式版与 Debug 调试版 APK。
  - **自动覆盖旧 APK**：
    1. 自动同步更新 GitHub Releases 标签 `latest-apk`，用新编译的 `chess-game-release.apk` 覆盖旧版本。
    2. 自动更新 GitHub Actions Artifacts。
    3. 自动向仓库分支提交覆盖 `apk/app-latest.apk`，保证永久提供最新可安装包。
  - **国内加速下载通道**：Release 发布页面及客户端弹窗自动生成 GHProxy、GitMirror、KKGitHub 镜像直链，国内网络免代理即点即下。
- `capacitor.config.json`：Capacitor 配置文件，配置 Android 原生包名 `com.guocui.chess`、应用名、HTTPS 协议与混合内容支持。
- `android/`：原生 Android Gradle 工程，预置 AndroidManifest、应用图标资源与 release debug 签名配置。
- `apk/README.md`：详细记录国内全网加速镜像下载直链格式与客户端安装说明。
