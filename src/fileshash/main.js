var drop_zone = document.getElementById('drop_zone');
var loader = document.querySelector('.loader');

const table = document.querySelector("#files_table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const hashHeader = document.getElementById('hash-header');
const hashAlgoSelect = document.getElementById('hash-algo');
const dropHint = document.getElementById('drop-hint');

var Hasher = null; // 在 initHashAlgorithm 中初始化
const TWO_GB = 2 * 1024 * 1024 * 1024; 
const SUPPORTED_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
const HINT_DEFAULT = '将单个或多个文件拖拽到该区域';
const HINT_UNSUPPORTED_TYPE = '请拖放文件，而不是字符串或其他不支持的格式';
const HINT_UNSUPPORTED_DIR = '包含文件夹及空文件，请拖入有效文件';
const HINT_DROP = '释放以进行计算';

// 从 URL 参数获取哈希算法
function getHashAlgorithmFromURL() {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get('hash');
    if (hashParam) {
        const normalized = hashParam.toUpperCase();
        if (SUPPORTED_ALGORITHMS.includes(normalized)) {
            return normalized;
        }
    }
    return 'SHA-1';
}

// 更新 URL 参数
function updateURLParam(algo) {
    const params = new URLSearchParams(window.location.search);
    params.set('hash', algo.toLowerCase());
    const newURL = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newURL);
}

// 更新表头显示当前算法
function updateHashHeader(algo) {
    hashHeader.textContent = algo;
}

// 初始化哈希算法选择
async function initHashAlgorithm() {
    const algo = getHashAlgorithmFromURL();
    hashAlgoSelect.value = algo;
    updateHashHeader(algo);
    Hasher = await hashwasm[algo === 'sha1' ? 'createSHA1' :
                            algo === 'sha256' ? 'createSHA256' :
                            algo === 'sha384' ? 'createSHA384' :
                            algo === 'sha512' ? 'createSHA512' :
                            'createSHA1']();
}

// 监听选择变化
hashAlgoSelect.addEventListener('change', (e) => {
    const algo = e.target.value;
    updateURLParam(algo);
    updateHashHeader(algo);
    // 清空已有结果
    tbody.innerHTML = '';
    thead.classList.add('noneDisplay');
    loader.style.display = 'none';
});

// 处理拖拽事件
drop_zone.addEventListener('dragenter', function (e) {
    e.preventDefault();

    // 检测是否为文件拖拽
    if (!e.dataTransfer.types.includes('Files')) {
        this.classList.add("unsupported");
        dropHint.textContent = HINT_UNSUPPORTED_TYPE;
    } else {
        this.classList.add("dragover");
        dropHint.textContent = HINT_DROP;
    }
}, false);

drop_zone.addEventListener('dragover', function (e) {
    e.preventDefault();
}, false);

drop_zone.addEventListener('dragleave', function (e) {
    if (e.relatedTarget && this.contains(e.relatedTarget)) {
        console.log("dragleave from children element");
        return false;
    }
    this.classList.remove("dragover");
    this.classList.remove("unsupported");
    dropHint.textContent = HINT_DEFAULT;
}, false);

drop_zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    drop_zone.classList.remove("dragover");
    drop_zone.classList.remove("unsupported");

    // 忽略非文件拖拽（如页面上的文字选择）
    if (e.dataTransfer.files.length === 0) {
        dropHint.textContent = HINT_DEFAULT;
        return;
    }

    // 正常处理文件
    dropHint.textContent = HINT_DEFAULT;
    thead.classList.remove('noneDisplay');
    loader.style.display = "flex";
    for (const file of e.dataTransfer.files) {
        display_file(file);
    }
}, false);

async function getFileInfo(file, hashAlgo) {
    const namePromise = new Promise(resolve => {
        resolve(file.name);
    });
    const sizePromise = new Promise(resolve => {
        resolve(file.size);
    });
    const [name, size] = await Promise.all([namePromise, sizePromise]);
    const hash = await getHash(file, hashAlgo);
    return { hash, size, name }
}

async function getFileSize(file) {
    return file.size;
}

async function getFileName(file) {
    return file.name;
}

async function infoDiff(){
    const tr1 = tbody.querySelector('tr');
    if (!tr1) {
        // 清空已有结果
        tbody.innerHTML = '';
        thead.classList.add('noneDisplay');
        loader.style.display = "none";
        return false;
    }
    let undone = 0;
    const td1 = tr1.querySelector('td[data-hash]');
    const hash = td1 ? td1.dataset.hash : '';
    for ( const tr of tbody.querySelectorAll('tr')) {
        const td = tr.querySelector('td[data-hash]');
        if (!td) continue;
        if (td.dataset.hash == '') {
            undone += 1;
        }
        if (td.dataset.hash == hash){
            tr.className = 'trGreen';
        }else{
            tr.className = 'trRed';
        }
    }
    if (undone == 0){
        loader.style.display = "none";
    }
}

// 格式化哈希值为人类友好模式
function formatHashHumanReadable(hash) {
    return hash.toUpperCase().replace(/(.{8})/g, '$1 ').trim();
}

// 格式化文件大小为人类可读格式
function formatSizeHumanReadable(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(2);
    return parseFloat(size) + ' ' + units[i];
}

// 切换单个 size 单元格的显示模式
function toggleSizeDisplay(td) {
    const bytes = td.dataset.size;
    const current = td.textContent;
    // 如果当前显示的是纯数字（原始字节），则切换到人类可读格式
    if (current === bytes) {
        td.textContent = formatSizeHumanReadable(parseInt(bytes));
    } else {
        // 切换回原始字节数
        td.textContent = bytes;
    }
}

// 切换单个哈希单元格的显示模式
function toggleHashDisplay(td) {
    const compact = td.dataset.hash;
    const current = td.textContent.replace(/\s/g, '');
    if (current === compact) {
        // 切换到人类友好模式
        td.textContent = formatHashHumanReadable(compact);
    } else {
        // 切换到紧凑模式
        td.textContent = compact;
    }
}

// 设置全局显示模式（切换所有哈希值）
function setAllHashDisplayMode(humanReadable) {
    tbody.querySelectorAll('td[data-hash]').forEach(td => {
        td.textContent = humanReadable ? formatHashHumanReadable(td.dataset.hash) : td.dataset.hash;
    });
}

async function display_file(file) {
    if (file.size === 0) { // 跳过文件夹
        // dropHint.textContent = HINT_UNSUPPORTED_DIR;  // 显示提示
        showToast(HINT_UNSUPPORTED_DIR);
        // setTimeout(() => {
        //     dropHint.textContent = HINT_DEFAULT;  // 2秒后恢复默认提示
        // }, 2000);
    } else {
        var tr = document.createElement('tr');
        const tdhash = document.createElement("td");
        const tdsize = document.createElement("td");
        const tdname = document.createElement("td");
        tr.appendChild(tdhash);
        tr.appendChild(tdsize);
        tr.appendChild(tdname);
        tbody.appendChild(tr);

        // 左键点击切换显示模式
        tdhash.addEventListener('click', (e) => {
            toggleHashDisplay(tdhash);
        });

        // 右键复制当前显示的哈希值格式
        tdhash.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(tdhash.textContent).then(() => {
                showToast('已复制到剪贴板');
                // 添加复制成功的视觉反馈
                tdhash.classList.add('copied');
                setTimeout(() => {
                    tdhash.classList.remove('copied');
                }, 100);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        });

        // 左键点击切换 size 显示模式
        tdsize.addEventListener('click', () => {
            toggleSizeDisplay(tdsize);
        });

        const fileName = file.name;
        const fileSize = file.size;
        tdsize.dataset.name = fileName;
        tdsize.dataset.size = fileSize;
        tdname.textContent = fileName;
        tdsize.textContent = fileSize;
        tdsize.classList.add('size-cell');
        
        const algorithm = hashAlgoSelect.value;
        let hash = '0';
        if (file.size < TWO_GB) {
            hash = await getHashStandard(file, algorithm);
        } else {
            hash = await getHashStreaming(file, Hasher);
        }

        // 存储原始哈希值，显示紧凑模式
        tdhash.dataset.hash = hash;
        tdhash.textContent = hash;
        tdhash.classList.add('hash-cell');
    }

    await infoDiff();
}

// 显示提示消息
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
}

// 使用浏览器标准 API 计算哈希（适合小文件）
const getHashStandard = async (file, algorithm) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const buffer = reader.result;
            const hashAsArrayBuffer = await crypto.subtle.digest(algorithm, buffer);
            const uint8ViewOfHash = new Uint8Array(hashAsArrayBuffer);
            if (typeof uint8ViewOfHash.toHex === 'function') {
                resolve(uint8ViewOfHash.toHex());
            } else {
                const hashHex = Array.from(uint8ViewOfHash)
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
                resolve(hashHex);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

// 使用 hash-wasm 进行流式哈希计算（适合大文件）
const getHashStreaming = async (file, hasher) => {
    // 分块读取文件
    const chunkSize = 32 * 1024 * 1024;
    hasher.init();

    for (let offset = 0; offset < file.size; offset += chunkSize) {
        const chunk = file.slice(offset, offset + chunkSize);
        const buffer = await chunk.arrayBuffer();
        hasher.update(new Uint8Array(buffer));

        // 让 UI 有机会更新
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    return hasher.digest();
};

// 根据文件大小自动选择哈希计算方式
const getHash = async (file, algorithm) => {
    
};

// 页面加载时初始化
initHashAlgorithm();
