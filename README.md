# 🎓 BetterScholar

**BetterScholar** 是一个轻量级的 Tampermonkey（油猴）用户脚本，旨在无缝增强 Google Scholar（谷歌学术）的文献检索体验。它在不破坏原生极简 UI 的前提下，为您添加了强大的**多维度排序、标签化展示以及出版商侧边栏过滤**功能。

## ✨ 核心功能 (Features)

- 📊 **高级排序 (Smart Sorting)**
  - 支持将当前页面的文献一键按 **“引用量 (Citations)”** 或 **“年份 (Year)”** 降序排列。
  - 支持一键 **“恢复默认排序”**，随时退回 Google 学术原生的相关性结果。
- 🏷️ **自动提取与标签化 (Auto-Tagging)**
  - 智能解析每篇文献的元数据，自动提取**发表年份**与**出版商/数据库**（如 IEEE, arXiv, Nature, Science, ACM, Elsevier 等）。
  - 在文献标题上方生成极简的、符合原生风格的灰色边框标签，一目了然。
- 🔍 **侧边栏动态过滤 (Sidebar Filtering)**
  - 自动收集当前页面出现的所有出版商，并在左侧边栏动态生成带复选框的过滤面板。
  - 自由勾选或取消勾选，快速隐藏不关心的数据库来源，实现精准找文。
- 🎨 **原生 UI 融合 (Native UI Experience)**
  - 拒绝花哨。所有按钮、标签、分割线均严格采用 Google Scholar 原生的色彩规范（纯白、浅灰边框、深灰文字及经典谷歌蓝），仿佛官方自带功能。

## 🚀 安装指南 (Installation)

1. 首先，请确保您的浏览器已安装 [Tampermonkey (油猴)](https://www.tampermonkey.net/) 扩展。
2. 点击此处安装脚本：稍后上传到Greasy Fork。
3. 或者，您也可以手动复制 `BetterScholar.js` 中的代码，在 Tampermonkey 中新建脚本并粘贴保存。

## 💻 使用方法 (Usage)

安装并启用脚本后，正常访问 [Google Scholar](https://scholar.google.com/) 并进行搜索。
- **顶部工具栏**：在“找到约 xxx 条结果”旁边，您会看到三个新增的排序按钮。
- **左侧边栏**：在默认的“按日期排序”选项下方，会自动出现“出版商过滤”面板。
- 所有的过滤与排序功能均可叠加使用。

## ⚠️ 局限性说明 (Limitations)

由于 Google Scholar 并没有开放全局按引用量排序的官方 API，**本脚本的所有排序和过滤功能仅对“当前已加载的页面”（通常为 10 或 20 条文献）有效**。 
本工具的定位是辅助您在当前检索结果页进行快速的“微观筛选”，无法实现跨越数百页的“宏观全局排序”。如果需要全局海量数据分析，建议配合专业的文献爬虫工具或 Publish or Perish 使用。

## 🛠️ 兼容性 (Compatibility)

已在以下域名测试通过：
- `scholar.google.com`
- `scholar.google.cz`
- `scholar.google.co.jp`

## 🤝 贡献与支持 (Contributing)

欢迎提交 Pull Request 或发起 Issue！如果您觉得这个脚本提升了您的科研效率，欢迎给这个项目点一个 ⭐️ Star。
