# LogicSim - 支持量词的逻辑电路模拟器

> 🎓 课程作业：改造 2021 年的旧版逻辑电路模拟器（[原项目](https://kuangdash.gitlab.io/logicsim)）

一个输入**逆波兰逻辑表达式**即可自动生成**逻辑电路图**的 Web 工具。本次改造在原有**命题逻辑**基础上，新增了**谓词逻辑量词支持**，并将界面升级为现代化的 Tailwind CSS + 深色模式。

## 🔗 在线演示

| 项目 | 地址 |
|------|------|
| **🌐 网站（GitHub Pages）** | https://wycwysgs.github.io/logicsim/ |
| **📦 项目仓库（GitHub）** | https://github.com/wycwysgs/logicsim |
| **📦 项目仓库（GitLab）** | https://gitlab.com/wycwysgs/logicsim |

## ✨ 功能特性

### 1. 命题逻辑（原有功能）

| 操作符 | RPN 格式 | 含义 |
|:------:|----------|------|
| `.` | `a b .` | a **AND** b（逻辑与）|
| `,` | `a b ,` | a **OR** b（逻辑或）|
| `<` | `a <` | **NOT** a（逻辑非）|
| `>` | `a b >` | a **→** b（推出）|
| `=` | `a b =` | a **↔** b（等价/同或）|

### 2. 谓词逻辑量词（🆕 本次改造新增）

| 操作符 | RPN 格式 | 含义 |
|:------:|----------|------|
| `∀` | `x φ ∀` | **∀x φ**（全称量词）|
| `∃` | `x φ ∃` | **∃x φ**（存在量词）|

**谓词表示法**：使用 `_` 连接参数

- `P_x` 表示 `P(x)`
- `R_x_y` 表示 `R(x, y)`

### 3. UI 改进（🆕 本次改造）

- 🎨 **Tailwind CSS** 现代化界面（替代原 w3.css）
- 🌙 **深色/浅色主题切换**（自动保存偏好）
- 📖 **语法提示面板**（含七种操作符说明与示例）
- 🗺️ 小地图导航 + 可缩放画布
- ✏️ 元素名称/备注编辑

## 🚀 使用示例

### 输入逆波兰表达式并解析

**命题逻辑：**

```
输入：a b . fe >
输出：(a AND b) → fe
```

```
输入：a b . fe ge > =
输出：(a AND b) ↔ (fe → ge)
```

**谓词逻辑（🆕）：**

```
输入：x P_x Q_x > ∀
输出：∀x(P(x) → Q(x))
```

```
输入：x P_x ∃
输出：∃x P(x)
```

```
输入：x y R_x_y ∃ ∀
输出：∀x∃y R(x, y)
```

### 操作步骤

1. 在"解析文本"按钮上方的文本框内输入**逆波兰逻辑表达式**
2. 点击 **"解析文本"** → 转换为适合图形表示的 JSON 格式
3. 点击 **"文本转图"** → 得到最终的正规逻辑电路图
4. （可选）拖动节点调整布局，或点击元素编辑名称/备注

## 🛠️ 技术栈

| 层面 | 技术 |
|------|------|
| **前端** | 原生 JavaScript（ES5）|
| **UI 框架** | Tailwind CSS + 自定义 CSS |
| **图形库** | JointJS + dagre（自动布局）+ graphlib |
| **依赖** | jQuery、lodash、Backbone.js、select2 |
| **部署** | GitHub Pages（`gh-pages` 分支）|

## 📁 项目结构

```
logicsim/
├── public/                     # 网站根目录（部署内容）
│   ├── index.html              # 主页面
│   ├── LogicParser.js          # 逆波兰表达式解析器（含量词支持）
│   ├── ViewGen.js              # 逻辑电路图生成器
│   ├── style.css               # 自定义样式（含深色模式）
│   ├── latch.json              # 示例数据
│   ├── assets/
│   │   ├── forall.svg          # 🆕 ∀ 全称量词图标
│   │   ├── exists.svg          # 🆕 ∃ 存在量词图标
│   │   ├── SEL.svg             # 多路选择器图标
│   │   └── ...                 # 其他元件图标
│   └── lib/                    # 第三方库
├── .gitlab-ci.yml              # GitLab CI（Pages 部署配置）
├── vercel.json                 # Vercel 部署配置
├── package.json                # Node.js 项目配置
├── DEPLOYMENT.md               # 部署文档
└── README.md                   # 本文档
```

## 💻 本地运行

### 方式一：直接打开（最简单）

```bash
git clone https://github.com/wycwysgs/logicsim.git
cd logicsim
# 双击 public/index.html 即可在浏览器打开
```

### 方式二：启动本地服务器（推荐）

```bash
# 使用 Python
cd public
python -m http.server 8000
# 访问 http://localhost:8000

# 或使用 Node.js
npx http-server public -p 3000
# 访问 http://localhost:3000
```

### 方式三：npm 脚本

```bash
npm install
npm run dev      # 启动本地服务器（端口 3000）
```

## 🚢 部署说明

### GitHub Pages（当前使用）

```bash
# 推送主分支
git push github main

# 推送网站文件到 gh-pages 分支
git subtree push --prefix public github gh-pages
```

启用后访问：`https://<用户名>.github.io/logicsim/`

### GitLab Pages

`.gitlab-ci.yml` 已配置完成，推送到 GitLab 默认分支后自动部署：

```yaml
image: alpine:latest
create-pages:
  pages:
    publish: public
  rules:
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
```

> ⚠️ 注意：GitLab Pages 需要在 **Settings → General → Visibility** 中把 Pages 权限设置为 **Everyone** 才能公开访问。

### Vercel

```bash
npm install -g vercel
vercel login
vercel          # 部署时 Output Directory 选择 public
```

`vercel.json` 已配置完成。

## 📊 改造对比

| 对比项 | 原版（2021）| 改造版 |
|--------|-------------|--------|
| 逻辑操作符 | 5 种（命题逻辑）| **7 种**（+ ∀、∃ 谓词逻辑）|
| 节点类型 | AND/OR/NOT/IMPLIES/EQUIV | **+ QUANT（量词节点）** |
| UI 框架 | w3.css | **Tailwind CSS** |
| 主题 | 仅浅色 | **浅色/深色可切换** |
| 帮助提示 | 静态文字 | **语法提示面板** |
| 量词图标 | ❌ | ✅ `forall.svg` / `exists.svg` |

## 🧪 测试

项目内置解析器回归测试，覆盖全部 7 种操作符与错误处理：

```bash
node test_parser.cjs
```

输出示例：

```
✅ 通过  AND                          "a b ." → 节点 7 个, 连线 7 条
✅ 通过  全称量词: forall x (P(x) -> Q(x))  "x P_x Q_x > ∀" → 节点 8 个, 连线 8 条
✅ 通过  嵌套量词: forall x exists y R(x,y) "x y R_x_y ∃ ∀" → 节点 6 个, 连线 5 条
用例总数: 15, 异常: 0
```

## 📝 更新日志

### v1.1.0 (2026-09-24) - 性能优化版

**性能优化（首屏体积 -718KB）**

- ⚡ `joint.js` (1.1MB) → `joint.min.js` (387KB)，压缩率 65%
- ⚡ 字体添加 `font-display: swap` 与 `preload`，减少文字闪烁
- 📉 页面总加载从 ~2.7MB 降至 **1.95MB**

**体验优化**

- 🔍 新增页面标题、SEO description、keywords、Open Graph 标签
- 🖼️ 新增 favicon 引用
- 🌙 主题初始化前移至 `<head>`，**消除深色模式白屏闪烁 (FOUC)**
- 🔄 主题跟随系统变化；localStorage 不可用时优雅降级
- ♿ 主题按钮添加 `aria-label` 无障碍属性
- 📱 新增窄屏响应式适配（900px / 640px 断点）

**代码质量**

- 🔧 `LogicParser.js` 重构：6 段重复操作符分支合并为**操作符表驱动**（`pop()` 调用 12 → 4 次）
- 🐛 修复隐式全局变量 bug（`for...of` 缺少 `var` 声明）
- 🇨🇳 错误提示全部中文化，集中管理于 `LOGIC_ERR`
- 📖 补充完整 JSDoc 与中文注释
- 🧹 `style.css` 清理未使用的 `.syntax-card` 死代码

**工程化**

- 📄 新增 `404.html` 自定义错误页
- 📄 新增 `.gitignore`、`LICENSE` (MIT)
- 🧪 新增 `test_parser.cjs` 回归测试（15 用例）
- 📝 README 完善（项目介绍、部署指南、改造对比）

### v1.0.0 (2026-09-24) - 课程改造版

- ✅ 新增全称量词 `∀` 支持
- ✅ 新增存在量词 `∃` 支持
- ✅ 新增 `QUANT` 节点类型与对应图形渲染
- ✅ 集成 Tailwind CSS，界面现代化
- ✅ 新增深色/浅色主题切换（偏好持久化）
- ✅ 新增语法提示面板（含七种操作符与示例）
- ✅ 添加多平台部署配置（GitHub Pages / GitLab Pages / Vercel）

### v0.1.0 (2021) - 原始版本

- 逆波兰逻辑表达式解析
- 五种命题逻辑操作符
- JointJS 电路图自动布局

## 📄 许可证

MIT License

## 🙏 致谢

- 原项目作者：[kuangdash](https://gitlab.com/kuangdash)（[原网站](https://kuangdash.gitlab.io/logicsim)）
- 图形库：[JointJS](https://www.jointjs.com/) / [dagre](https://github.com/dagrejs/dagre)
- UI 框架：[Tailwind CSS](https://tailwindcss.com/)
