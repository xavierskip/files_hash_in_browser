var drop_zone = document.getElementById('drop_zone');
var loader = document.querySelector('.loader');

const table = document.querySelector("#files_table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

drop_zone.addEventListener('dragenter', function (e) {
    this.classList.add("dragover");
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
}, false);

drop_zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    // console.log("drop", e, this);
    // recover drop_zone background color
    drop_zone.classList.remove("dragover");
    // show table thead
    thead.classList.remove('noneDisplay');
    for (const file of e.dataTransfer.files) {
        display_file(file);
        // await display_file(file);
    }
    // show loader
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
    // const hash = await fileHash(file);
    const hash = await getHash(file);
    return { hash, size, name }
}

async function getFileSize(file) {
    return file.size; // 读取文件大小
}

async function getFileName(file) {
    return file.name; // 读取文件名称
}

async function infoDiff(){
    const hash = tbody.querySelector('tr td').textContent;
    let undone = 0;
    if (hash == "") {
        return false;
    }
    for ( const tr of tbody.querySelectorAll('tr')) {
        const td = tr.querySelector('td');
        // console.log(td.textContent);
        if (td.textContent == '') {
            undone += 1;
        }
        if (td.textContent == hash){
            tr.className = 'trGreen';
        }else{
            tr.className = 'trRed';
        }
    }
    // display loader
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

async function fileHash(file) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API/Non-cryptographic_uses_of_subtle_crypto#hashing_a_file
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashString;
}

const getHash = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const buffer = reader.result;
            const hashArray = await crypto.subtle.digest('SHA-1', buffer);
            const hashHex = Array.from(new Uint8Array(hashArray))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            resolve(hashHex);
        };
        reader.readAsArrayBuffer(file);
    });
};
