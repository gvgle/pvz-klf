# GitHub Pages 白屏问题修复指南

## 问题诊断

当前部署的网页显示的是开发模式的 HTML（包含 `/src/main.tsx` 引用），而不是构建后的生产文件。这是因为 GitHub Pages 配置不正确。

## 解决方案

### 方法 1：修改 GitHub Pages 设置（推荐）

1. 访问：https://github.com/gvgle/pvz-klf/settings/pages

2. 在 "Source" 部分选择：
   - **Build and deployment** → **GitHub Actions**

   或者如果已经选择了 GitHub Actions，确保：
   - Workflow 文件位于 `.github/workflows/static.yml` 或类似路径
   - Pages 已正确配置为从 GitHub Actions 接收部署

3. 确保仓库 **Settings** → **Pages** → **Build and deployment** 配置为：
   ```
   Source: GitHub Actions
   ```

4. 等待几分钟后，GitHub Actions 会自动重新部署

### 方法 2：使用 gh-pages 手动部署

如果 GitHub Actions 不工作，可以手动使用 gh-pages 包部署：

```bash
cd /path/to/pvz-klf

# 安装 gh-pages（如果没有）
npm install -D gh-pages

# 构建项目
npm run build

# 部署到 gh-pages 分支
npx gh-pages -d dist --dotfiles=true

# 或者使用 deploy.sh
bash deploy.sh
```

### 方法 3：推送到根目录（不推荐但可用）

如果问题持续，可以修改配置使用传统的 GitHub Pages 部署：

1. 安装 gh-pages：
```bash
npm install -D gh-pages
```

2. 在 package.json 添加部署脚本：
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist --dotfiles=true"
  }
}
```

3. 部署：
```bash
npm run deploy
```

## 验证修复

修复后，访问 https://pvz.guagle.com/，查看页面源代码应该看到：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>伟大的柯立帆 - Plants vs Zombies Web Edition</title>
    <script type="module" crossorigin src="./assets/index-*.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index-*.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

注意 `src` 属性应该指向 `./assets/` 而不是 `/src/`。

## GitHub Actions 检查

查看部署状态：https://github.com/gvgle/pvz-klf/actions

确保最新的 workflow 运行状态是绿色的（成功）。
