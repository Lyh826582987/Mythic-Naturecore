# ✨ Mythic Naturecore — 我们的私密空间

> 一个属于 **[陈昊](https://github.com/chenhao)** 与 **陈璐** 的情侣专属网站。  
> 记录在一起的每一天，每一张照片，每一句想说给你的话。

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey)](https://expressjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 🖼️ 预览

首页采用视差滚动 + 帷幕开场的暗黑电影感设计：

- **纪念日倒计时** — 首页数字跳动，实时显示在一起的天数
- **照片墙** — 上传属于我们的回忆，瀑布流展示
- **日常记录** — 每日一篇，记录生活点滴
- **留言板** — 她和我，一人一句悄悄话
- **每日一问** — 每天一个问题，让彼此更了解彼此
- **背景音乐** — 打开首页，自动响起属于我们的歌

---

## 📁 项目结构

```
情侣网站/
├── server.js                # 服务入口
├── package.json             # 依赖说明
├── .gitignore               # Git 忽略规则（见下方）
├── data/                    # Excel 数据库（自动生成）
│   ├── settings.xlsx        #   纪念日 + 音乐配置
│   ├── photos.xlsx          #   照片元数据
│   ├── records.xlsx         #   日常记录
│   ├── messages.xlsx        #   留言内容
│   └── questions.xlsx       #   每日一问问题库
├── routes/                  # REST API 路由
│   ├── settings.js          #   /api/settings
│   ├── photos.js            #   /api/photos
│   ├── records.js           #   /api/records
│   ├── messages.js          #   /api/messages
│   └── questions.js         #   /api/questions
├── lib/
│   └── excel.js             # Excel 读写引擎
└── public/                  # 前端页面 + 静态资源
    ├── index.html           #   首页（视差滚动）
    ├── worlds.html          #   照片墙
    ├── atelier.html         #   日常记录 + 每日一问
    ├── codex.html           #   留言板
    ├── admin.html           #   后台管理
    ├── bg/                  #   首页背景图
    ├── music/               #   背景音乐文件
    └── uploads/             #   上传的照片
```

### Git 忽略规则（`.gitignore`）

```gitignore
node_modules/
public/uploads/*
!public/uploads/.gitkeep
public/music/*
!public/music/.gitkeep
data/*.xlsx
.DS_Store
Thumbs.db
*.log
```

> 上传的照片、音乐文件、Excel 数据以及 `node_modules` 不会提交到 Git。  
> 空白占位文件 `.gitkeep` 用于保留目录结构。

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18（[下载安装](https://nodejs.org)）

### 1. 克隆项目

```bash
git clone https://github.com/3348066149/mythic-naturecore.git
cd mythic-naturecore
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

```bash
npm start
```

终端会打印：

```
========================================================
  ✨  Mythic Naturecore — Reverie  服务已启动 ✨
========================================================

  📡  服务地址：
      本地访问  →  http://localhost:3000
      局域网    →  http://192.168.x.x:3000

  🌐  前端页面：
      首页      →  http://192.168.x.x:3000/index.html
      照片墙    →  http://192.168.x.x:3000/worlds.html
      日常      →  http://192.168.x.x:3000/atelier.html
      留言      →  http://192.168.x.x:3000/codex.html

  ⚙️  后台管理：
      Admin UI  →  http://192.168.x.x:3000/admin.html

========================================================
```

### 4. 打开浏览器

- 用局域网 IP 在同一 Wi-Fi 下的手机或电脑上也能访问
- 你和璐璐可以同时打开各自手机，互不干扰

---

## 🎯 功能指南

### 首页（index.html）

| 功能 | 说明 |
|------|------|
| 纪念日倒计时 | 显示在一起的天数，从后台设置起始日期开始计算 |
| 里程碑提醒 | 自动显示最近的里程碑（100天、365天、520天、999天……） |
| 最近照片 | 右侧展示最近的 3 张照片，点击跳转照片墙 |
| 向下滚动 | 帷幕打开→传送门放大→深空场景，逐层展开 |

### 照片墙（worlds.html）

- 上传照片：选择文件 + 填写日期和描述
- 按时间倒序展示，瀑布式布局
- 点击照片弹窗放大查看

### 日常记录（atelier.html）

- **记录 Tab**：写日记，按日期管理
- **问答 Tab**：每天一个问题，彼此分别回答，答案按日期存档

### 留言板（codex.html）

- 切换「❤️ 我」「💙 TA」身份发送留言
- 留言按时间倒序展示，支持删除
- 刚刚 / X 分钟前 / X 小时前 / X 天前 的时间显示

### 后台管理（admin.html）

这是 **只有你（陈昊）** 使用的地方：

| Tab | 功能 |
|-----|------|
| ⚙️ 基础设置 | 修改纪念日起始日期、上传背景音乐、调节音量 |
| 📷 照片管理 | 上传添加照片、预览、删除 |
| 📝 日常记录 | 新建、编辑、删除记录 |
| 💬 留言管理 | 查看、删除留言 |
| ❓ 问题库 | 新增、编辑、删除每日一问的问题 |

---

## 🔧 技术架构

### 设计理念

- **零数据库** — 不依赖 MySQL / MongoDB / SQLite，所有数据保存在 Excel 文件（`.xlsx`）中
- **便携部署** — 整个项目文件夹可以随意移动、打包、拷贝，无需配置任何外部服务
- **局域网共享** — 启动后在 Wi-Fi 下所有设备都能访问
- **暗黑电影感设计** — 深色基底 `#0a0608`，`Viaoda Libre` + `Imprima` 字体，毛玻璃效果，平滑动画

### 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | [Express 5.x](https://expressjs.com) |
| 数据库 | [SheetJS (xlsx)](https://sheetjs.com) — Excel 文件作为数据存储 |
| 文件上传 | [Multer](https://github.com/expressjs/multer) |
| 前端 | 原生 HTML + CSS + JS（无框架依赖） |
| 字体 | Google Fonts — Viaoda Libre + Imprima |
| 背景图 | 本地存储，不依赖外部 CDN |

### API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/settings` | 获取纪念日 + 音乐配置 |
| `PUT` | `/api/settings` | 更新设置 |
| `POST` | `/api/settings/upload-music` | 上传背景音乐 |
| `GET` | `/api/photos` | 获取所有照片 |
| `POST` | `/api/photos` | 上传照片（form-data） |
| `DELETE` | `/api/photos/:index` | 删除照片 |
| `GET` | `/api/records` | 获取所有记录 |
| `POST` | `/api/records` | 新增记录 |
| `PUT` | `/api/records/:date` | 更新记录 |
| `DELETE` | `/api/records/:date` | 删除记录 |
| `GET` | `/api/messages` | 获取所有留言 |
| `POST` | `/api/messages` | 发送留言 |
| `DELETE` | `/api/messages/:index` | 删除留言 |
| `GET` | `/api/questions` | 获取问题列表 |
| `GET` | `/api/questions/today` | 获取今日问题 |
| `POST` | `/api/questions` | 新增问题 |
| `PUT` | `/api/questions/:index` | 修改问题 |
| `DELETE` | `/api/questions/:index` | 删除问题 |
| `GET` | `/api/questions/answers` | 获取所有回答 |
| `GET` | `/api/questions/answers/today` | 获取今日回答 |
| `PUT` | `/api/questions/answers/today` | 保存今日回答 |

---

## 🎨 自定义

### 修改纪念日

打开后台管理 → 基础设置 → 修改日期 → 保存。

### 更换背景音乐

打开后台管理 → 基础设置 → 上传音乐文件 → 调节音量。

支持格式：MP3 / OGG / WAV / WebM / AAC / FLAC，最大 20MB。

### 更换首页背景图

将你的图片放到 `public/bg/` 目录，然后修改 `public/index.html` 中的这几行：

```js
var WORLD_BG = 'bg/world_bg.webp';      // 绿色森林背景
var PORTAL_BG = 'bg/portal_bg.webp';    // 魔法传送门
var CURTAIN_LEFT = 'bg/curtain_left.webp';   // 左帷幕
var CURTAIN_RIGHT = 'bg/curtain_right.webp'; // 右帷幕
```

---

## 💡 为什么用 Excel 当数据库？

- 📦 打包方便：整个项目就是一个文件夹，拷贝到 U 盘也能跑
- 🔍 可读性强：Excel 文件可以直接打开查看数据，不需要数据库客户端
- 🪶 零配置：不需要装 MySQL、不需要配连接字符串
- 🔒 私密性好：所有数据都在本地，不经过云服务

对于两个人使用的情侣网站来说，Excel 完全够用且优雅。

---

## 📝 写给璐璐

> 从 `2024-01-01` 那天开始算起，每一天都是我们故事的一个字节。  
> 这个网站会一直在线，记录我们走过的每一个里程碑。  
> 100 天、365 天、520 天、999 天、1314 天……  
> 等到我们老了，打开还能看到年轻时候的我们。  
>
> — 陈昊 💕

---

## 📄 License

MIT © [陈昊](https://github.com/3348066149)
