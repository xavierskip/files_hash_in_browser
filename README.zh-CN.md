# 文件 Hash 计算器

浏览器端文件哈希计算工具。无需上传，本地计算。

主要用来多个 Hash 值之间比对。

使用浏览器标准函数来计算 Hash 值。因为标准函数的限制，对于大文件的 Hash 值计算引入了 [hash-wasm](https://github.com/Daninet/hash-wasm) 进行流式计算。

支持 Hash 算法：SHA-1、SHA-256、SHA-384、SHA-512。

## 展示页面

[页面地址](https://files-hash-in-browser.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xavierskip/files_hash_in_browser&repository-name=files_hash_in_browser)

![preview](screenshot.png)

## 功能特点

- 使用 Web Crypto API (`crypto.subtle.digest`) 进行哈希计算
- 支持多种哈希算法：SHA-1、SHA-256、SHA-384、SHA-512
- 并行获取文件的hash
- 拖拽文件或点击按钮选择文件
- 小文件使用浏览器原生 API，大文件(≥2GB)切换为流式计算
- **点击切换**：单击 hash 值在紧凑格式和可读格式（每8字符空格分隔）间切换；单击大小在字节数和 KB/MB/GB 间切换
- **右键复制**：右击 hash 值复制当前显示格式到剪贴板
- 以第一个文件为基准，相同 hash 显示绿色，不同显示红色
- 支持 URL 参数预选择算法：`?hash=sha-256`（不区分大小写）
- PWA 支持离线使用

## 使用方法

将文件拖拽到页面指定位置，就可以在页面中显示文件的 hash 值，可以一次拖入多个文件，也可多次拖入文件，同时得到文件的 hash 值用于比对，以**第一个文件的hash值作为标准**，与之相同的显示为绿色字体，不同则为红色字体，这样，文件是否相同一目了然。

## 产生背景

经常会有不同的人发文件给我，有可能的情况是文件名不一样但是是同一个文件，也有可能文件名一样但不是同一个文件，这让我十分困惑，我不知道这个文件是新的文件还是重复的文件，显然比较文件是否相同的最好方法就是比较文件的 hash 值，我平常都是使用的右键菜单里 7zip 提供的计算"CRC SHA"功能，不仅要在二级菜单中多点几次鼠标，而且每个文件弹出来的都是一个独立的窗口，肉眼无法直观的进行比对，于是想制作一个**能够把文件hash值显示在一起的GUI软件**，便于比对，而且要**支持鼠标拖拽操作**，这样可以避免在不同的文件路径中选来选去出错了。

## 项目结构

```
src/fileshash/
├── index.html              # 单页面布局，包含算法选择器、拖放区域和结果表格
├── main.js                 # 核心逻辑：拖放处理、哈希计算、视觉对比
├── style.css               # 样式：颜色编码结果（绿色/红色）、响应式表格布局
├── i18n.js                 # 多语言国际化支持
├── manifest.json           # PWA 应用清单配置
├── service-worker.js       # Service Worker 离线缓存
```

## 本地开发

这是一个纯静态网页项目，无需构建工具或依赖。

```bash
# 使用任意静态服务器运行 src/fileshash/ 目录
python -m http.server 8000 --directory src/fileshash/
# 推荐使用 npx，因为 npx 能够更好的处理 MIME types
npx serve src/fileshash/
```

然后访问 http://localhost:8000

## 注意事项

浏览器标准函数 [crypto.subtle.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)不支持流式输入，由于该 API 需要将整个文件读入内存，受限于浏览器本身的限制，无法计算大文件的 Hash 值。（桌面端浏览器通常有 2GB 内存限制，移动端浏览器可能限制更多）。

所以对于容量巨大的文件，将使用 [hash-wasm](https://github.com/Daninet/hash-wasm) 进行流式分块计算，可支持超大文件。

