## demo
[演示](https://files-hash-in-browser.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xavierskip/files_hash_in_browser&repository-name=files_hash_in_browser)

## 作用

将文件拖拽到页面指定位置，就可以在页面中显示文件的 hash 值，可以一次、多次拖入多个文件，同时得到文件的 hash 值用于比对，以**第一个文件的hash值作为标准**，与之相同的显示为绿色字体，不同则为红色字体，这样，文件是否相同一目了然。

## 产生背景

经常会有不同的人发文件给我，有可能的情况是文件名不一样但是是同一个文件，也有可能文件名一样但不是同一个文件，这让我十分困惑，我不知道这个文件是新的文件还是重复的文件，显然比较文件是否相同的最好方法就是比较文件的 hash 值，我平常都是使用的右键菜单里 7zip 提供的计算"CRC SHA"功能，不仅要在二级菜单中多点几次鼠标，而且每个文件弹出来的都是一个独立的窗口，肉眼无法直观的进行比对，于是想制作一个**能够把文件hash值显示在一起的GUI软件**，便于比对，而且要**支持鼠标拖拽操作**，这样可以避免在不同的文件路径中选来选去出错了。

## 采用的技术
- 可选择多种 hash 算法：SHA-1、SHA-256、SHA-384、SHA-512
- 并行获取文件的hash
- 使用 Web Crypto API (`crypto.subtle.digest`) 进行哈希计算
- 支持 URL 参数预选择算法：`?hash=sha-256`（不区分大小写）
- PWA 应用支持离线使用。

## 项目结构
```
src/fileshash/
├── index.html    # 单页面布局，包含算法选择器、拖放区域和结果表格
├── main.js       # 核心逻辑：拖放处理、哈希计算、视觉对比
└── style.css     # 样式：颜色编码结果（绿色/红色）、响应式表格布局
```

## 本地开发
这是一个纯静态网页项目，无需构建工具或依赖。
```bash
# 使用任意静态服务器运行 src/fileshash/ 目录
python -m http.server 8000 --directory src/fileshash/
# 或
npx serve src/fileshash/
```
然后访问 http://localhost:8000

## 需要注意的事

因为采用了浏览器标准函数 [crypto.subtle.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) 来计算hash值，此函数不支持流式输入，将数据传入摘要函数之前，必须先将整个输入读入内存，因此超过2GB大小文件无法通过浏览器的标准函数获取到hash值（桌面端浏览器对此的限制通常是2GB大小，其他的我没有测试，不太清楚）。

所以引入了[hash-wasm](https://github.com/Daninet/hash-wasm)。用于计算大于2GB文件的hash值。

## 截图
![preview](screenshot.png)

---

## Translate

## role of software

Drag the file to the designated position on the page, and its hash value will be displayed. You can drag one or multiple files at once, and their hash values will be shown for comparison. **Using the first file's hash value as the standard**, matching values are displayed in green text, while differing ones appear in red text. This makes it immediately clear whether the files are identical.

## background

Different people often send me files, and it's possible that the file names are different but the files themselves are identical, or that the file names are the same but the files differ. This leaves me quite confused—I can't tell whether a file is new or a duplicate. Clearly, comparing hash values is the best way to determine if two files are identical. I usually rely on 7zip's "CRC SHA" feature from the right-click menu, which not only requires multiple clicks through submenus but also opens separate windows for each file, making visual comparison difficult. Therefore, I want to create **a GUI software that displays file hash values together** for easier comparison and **supports drag-and-drop operations**, so I can avoid errors when navigating through different file paths.

## technical details

- Multiple hash algorithms available: SHA-1, SHA-256, SHA-384, SHA-512
- Retrieve file hashes in parallel
- Hash calculation using Web Crypto API (`crypto.subtle.digest`)
- URL parameter support for pre-selecting algorithm: `?hash=sha-256` (case-insensitive)

## Project Structure
```
src/fileshash/
├── index.html    # Single-page layout with algorithm selector, drop zone and results table
├── main.js       # Core logic: drag-drop handling, hash calculation, visual comparison
└── style.css     # Styling: color-coded results (green/red), responsive table layout
```

## Local Development
This is a static web project with no build system or dependencies.
```bash
# Serve src/fileshash/ directory with any static server
python -m http.server 8000 --directory src/fileshash/
# or
npx serve src/fileshash/
```
Then open http://localhost:8000

## known issue
Files larger than 2GB in size could not be hashed. This may have been due to browser sandbox limitations with `FileReader.readAsArrayBuffer()`.
