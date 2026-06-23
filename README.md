# 📚 英语小达人 — 前端应用

> 面向中国小学生的游戏化英语学习 Web 应用，基于 Vue 3 + Vite 构建。

## 功能模块

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 欢迎问候、快捷入口、每日推荐单词 |
| 角色选择 | `/user` | 创建/切换/删除学习角色 |
| 单词学习 | `/learn` | 按年级、学期、单元浏览词汇 |
| 单元学习 | `/learn/:grade/:semester` | 翻转卡片式学习，配有发音和例句 |
| 闯关测验 | `/quiz` | 听音辨词游戏，支持三种难度 |
| 错题复习 | `/review` | 卡片/列表两种模式复习薄弱单词 |
| 学习报告 | `/progress` | 进度统计、成就系统、积分排行 |

## 技术栈

- **框架**：Vue 3（`<script setup>` 组合式 API）
- **构建**：Vite 8
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **样式**：纯 CSS，响应式设计（移动端 → 平板 → 桌面全屏）
- **字体**：Fredoka（展示）+ Noto Sans SC（正文），Google Fonts
- **音频**：预生成的 MP3 文件，通过 manifest 索引

## 项目结构

```
frontend/
├── index.html                 # 入口 HTML（含 Google Fonts 加载）
├── package.json               # 依赖与脚本
├── vite.config.js             # Vite 配置
├── public/                    # 静态资源（不经过构建）
│   └── data/
│       ├── words/             # 词汇 JSON 数据
│       │   ├── vocabulary.json    # 完整词汇表（780 条）
│       │   └── topics.json        # 按主题分类
│       └── audio/             # TTS 发音文件
│           ├── words/             # 单词发音（740 个 MP3）
│           ├── sentences/         # 例句发音（758 个 MP3）
│           └── audio_manifest.json # 音频索引（wordId → 文件路径）
└── src/
    ├── main.js                # 应用入口，注册 Router + Pinia
    ├── App.vue                # 根组件，组合 Header + Content + Nav
    ├── router/
    │   └── index.js           # 路由定义与守卫（未登录跳转角色选择）
    ├── stores/
    │   ├── user.js            # 用户状态（多角色、进度、错题、积分）
    │   └── vocabulary.js      # 词汇数据加载与查询
    ├── composables/
    │   └── useAudio.js        # 音频播放（含 MD5 哈希 + manifest 索引）
    ├── components/
    │   ├── AppHeader.vue      # 顶部栏（返回按钮、用户头像、积分）
    │   └── AppNav.vue         # 导航栏（移动端底部 / 桌面端左侧边栏）
    ├── views/
    │   ├── HomeView.vue       # 首页
    │   ├── UserSelectView.vue # 角色选择
    │   ├── LearnView.vue      # 学习内容选择
    │   ├── LearnUnitView.vue  # 单元单词学习
    │   ├── QuizView.vue       # 闯关测验
    │   ├── ReviewView.vue     # 错题复习
    │   └── ProgressView.vue   # 学习报告
    └── assets/
        └── styles/
            └── main.css       # 全局样式 + 设计令牌 + 响应式断点
```

## 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览生产构建
npm run preview
```

### 注意事项

- `public/data/audio/` 包含约 1500 个 MP3 文件，体积较大，已从 Git 中排除。首次运行前请确保音频文件已就位（见主项目 `scripts/` 目录下的 TTS 生成脚本）。
- 音频文件通过 `audio_manifest.json` 索引，前端使用 `wordId` 查找对应路径，无需在运行时计算哈希。

## 设计系统

### 色彩令牌

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--deep` | `#2D1B69` | 侧边栏深色底 |
| `--primary` | `#7C5CFC` | 主色调（魔法紫） |
| `--primary-light` | `#B8A9FF` | 悬停态、次要元素 |
| `--teal` | `#2DD4BF` | 成功、掌握 |
| `--amber` | `#FBBF24` | 星星、积分、奖励 |
| `--coral` | `#FB7185` | 错题、提醒 |
| `--bg-page` | `#F5F3FF` | 页面底色 |

### 响应式断点

| 断点 | 布局 | 导航 |
|------|------|------|
| `< 768px` | 单列，`max-width: 520px` | 底部导航栏 |
| `768px+` | 单列，`max-width: 720px` | 底部导航栏（增强） |
| `1024px+` | 侧边栏 + 全屏内容区 | 左侧深色侧边栏（240px） |
| `1440px+` | 同上，更大间距和多列网格 | 同上 |
| `1920px+` | 侧边栏 280px | 同上（加宽） |

## 词汇数据格式

每条词汇包含以下字段：

```json
{
  "id": 1,
  "grade": 3,
  "semester": 1,
  "unit": 1,
  "topic": "问候",
  "english": "hello",
  "chinese": "你好",
  "phonetic": "/həˈloʊ/",
  "partOfSpeech": "interj.",
  "example": "Hello, how are you?",
  "exampleCn": "你好，你好吗？"
}
```

## 许可证

MIT
