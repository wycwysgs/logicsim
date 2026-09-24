# LogicSim - 带量词支持的逻辑电路模拟器

## 项目简介

这是一个支持**命题逻辑**和**谓词逻辑**的电路模拟器，支持：
- ✅ 五种命题逻辑运算符：AND、OR、NOT、IMPLIES、EQUIV
- ✅ 两种谓词逻辑量词：∀（全称）、∃（存在）
- ✅ 自动布局电路图
- ✅ 浅色/深色主题切换
- ✅ 语法提示面板

## 功能特性

### 1. 命题逻辑支持

| 运算符 | RPN 格式 | 含义 |
|--------|----------|------|
| `.` | `a b .` | a AND b |
| `<` | `a <` | NOT a |
| `,` | `a b ,` | a OR b |
| `=` | `a b =` | a ↔ b (等价) |
| `>` | `a b >` | a → b (推出) |

### 2. 谓词逻辑支持（新增）

| 运算符 | RPN 格式 | 含义 |
|--------|----------|------|
| `∀` | `x φ ∀` | ∀x φ (全称量词) |
| `∃` | `x φ ∃` | ∃x φ (存在量词) |

**谓词表示法**：使用 `_` 连接参数
- `P_x` 表示 P(x)
- `R_x_y` 表示 R(x,y)

### 3. UI 特性

- 🌙 深色/浅色主题切换（自动保存偏好）
- 📖 语法提示面板（含示例）
- 🎨 Tailwind CSS 现代化界面
- 🔍 小地图导航
- 📐 可缩放画布

## 使用示例

### 命题逻辑示例
```
输入: a b . fe >
含义: (a AND b) → fe
```

### 谓词逻辑示例
```
输入: x P_x Q_x > ∀
含义: ∀x(P(x) → Q(x))

输入: x P_x ∃
含义: ∃x P(x)

输入: x y R_x_y ∃ ∀
含义: ∀x∃y R(x,y)
```

## 部署到 Vercel Pages

### 方式一：通过 Vercel CLI 部署（推荐）

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
cd logicsim
vercel
```

4. 选择项目设置：
   - Framework Preset: Static/Other
   - Build Command: (空)
   - Output Directory: `public`

### 方式二：通过 GitHub 仓库部署

1. 创建 GitHub 仓库并推送代码：
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd logicsim
git add -A
git commit -m "feat: add quantifier support"
git push origin main
```

2. 在 Vercel 官网创建项目：
   - 访问 https://vercel.com/new
   - 导入 GitHub 仓库
   - 设置 Output Directory 为 `public`
   - 点击 Deploy

### 方式三：通过 GitLab Pages 部署

1. 更新 `.gitlab-ci.yml`：
```yaml
image: busybox

pages:
  stage: deploy
  script:
    - echo "The site will be deployed to $CI_PAGES_URL"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

2. 推送代码后，GitLab 会自动部署到 `$CI_PAGES_URL`

## 本地开发

### 启动本地服务器

```bash
# 使用 Python
cd public
python -m http.server 8000

# 或使用 Node.js
npx http-server public -p 8000

# 或直接打开 index.html
```

### 测试

```bash
# 运行解析器测试
node test_parser.cjs
```

## 技术栈

- **前端**: Vanilla JavaScript
- **CSS**: Tailwind CSS + 自定义样式
- **图表**: JointJS + dagre
- **部署**: Vercel Pages / GitLab Pages

## 目录结构

```
logicsim/
├── public/
│   ├── index.html          # 主页面
│   ├── LogicParser.js      # 解析器（含量词支持）
│   ├── ViewGen.js          # 电路图生成器
│   ├── style.css           # 样式（含深色模式）
│   ├── assets/
│   │   ├── forall.svg      # ∀ 图标
│   │   ├── exists.svg      # ∃ 图标
│   │   ├── SEL.svg         # 多路选择器图标
│   │   └── ...             # 其他图标
│   └── lib/                # 第三方库
├── vercel.json             # Vercel 配置
├── package.json            # Node.js 配置
└── README.md               # 项目文档
```

## 更新日志

### v1.0.0 (2026-09-24)
- ✅ 新增全称量词 (∀) 支持
- ✅ 新增存在量词 (∃) 支持
- ✅ 新增 QUANT 节点类型
- ✅ 集成 Tailwind CSS
- ✅ 新增深色/浅色主题切换
- ✅ 新增语法提示面板

## 许可证

MIT License
