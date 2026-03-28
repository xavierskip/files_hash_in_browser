var drop_zone = document.getElementById('drop_zone');
var loader = document.querySelector('.loader');

const table = document.querySelector("#files_table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const hashHeader = document.getElementById('hash-header');
const hashAlgoSelect = document.getElementById('hash-algo');
const dropHint = document.getElementById('drop-hint');
const HINT_DEFAULT = '将单个或多个文件拖拽到该区域';
const HINT_DROP = '释放以进行计算';

// 从 URL 参数获取哈希算法
function getHashAlgorithmFromURL() {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get('hash');
    if (hashParam) {
        const normalized = hashParam.toUpperCase();
        const supported = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
        if (supported.includes(normalized)) {
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
function initHashAlgorithm() {
    const algo = getHashAlgorithmFromURL();
    hashAlgoSelect.value = algo;
    updateHashHeader(algo);
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

drop_zone.addEventListener('dragenter', function (e) {
    this.classList.add("dragover");
    dropHint.textContent = HINT_DROP;
    e.preventDefault();
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
    dropHint.textContent = HINT_DEFAULT;
}, false);

drop_zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    drop_zone.classList.remove("dragover");
    dropHint.textContent = HINT_DEFAULT;
    thead.classList.remove('noneDisplay');
    for (const file of e.dataTransfer.files) {
        display_file(file);
    }
    loader.style.display = "flex";
}, false);

async function getFileInfo(file) {
    const namePromise = new Promise(resolve => {
        resolve(file.name);
    });
    const sizePromise = new Promise(resolve => {
        resolve(file.size);
    });
    const [name, size] = await Promise.all([namePromise, sizePromise]);
    const hash = await getHash(file);
    return { hash, size, name }
}

async function getFileSize(file) {
    return file.size;
}

async function getFileName(file) {
    return file.name;
}

async function infoDiff(){
    const hash = tbody.querySelector('tr td').textContent;
    let undone = 0;
    if (hash == "") {
        return false;
    }
    for ( const tr of tbody.querySelectorAll('tr')) {
        const td = tr.querySelector('td');
        if (td.textContent == '') {
            undone += 1;
        }
        if (td.textContent == hash){
            tr.className = 'trGreen';
        }else{
            tr.className = 'trRed';
        }
    }
    if (undone == 0){
        loader.style.display = "none";
    }
}

async function display_file(file) {
    var tr = document.createElement('tr');
    const tdhash = document.createElement("td");
    const tdsize = document.createElement("td");
    const tdname = document.createElement("td");
    tr.appendChild(tdhash);
    tr.appendChild(tdsize);
    tr.appendChild(tdname);
    tbody.appendChild(tr);

    tdsize.textContent = await getFileSize(file);
    tdname.textContent = await getFileName(file);
    tdhash.textContent = await getHash(file);
    await infoDiff();
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API/Non-cryptographic_uses_of_subtle_crypto#hashing_a_file
const getHash = async (file) => {
    const algorithm = hashAlgoSelect.value;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const buffer = reader.result;
            const hashArray = await crypto.subtle.digest(algorithm, buffer);
            const hashHex = Array.from(new Uint8Array(hashArray))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            resolve(hashHex);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

// 页面加载时初始化
initHashAlgorithm();
