// i18n.js - 轻量级多语言支持模块
(function() {
    'use strict';

    // 翻译字典
    const translations = {
        'zh': {
            'page_title': '哈希值比对器',
            'algo_label': 'Hash算法:',
            'size_header': '大小',
            'name_header': '名称',
            'hint_default': '将单个或多个文件拖拽到该区域',
            'hint_unsupported_type': '请拖放文件，而不是字符串或其他不支持的格式',
            'hint_unsupported_dir': '包含文件夹及空文件，请拖入有效文件',
            'hint_drop': '释放以进行计算',
            'hint_error': '发生了点错误',
            'display_hint': '(点击哈希值切换格式，右键复制)',
            'select_file': '选择文件',
            'copy_success': '已复制到剪贴板',
            'language': '🌐 语言',
            'lang_zh': '中文',
            'lang_en': 'English',
            'lang_es': 'Español',
            'lang_fr': 'Français',
            'test_page': 'Hash-WASM 测试'
        },
        'en': {
            'page_title': 'File Hash Comparator',
            'algo_label': 'Hash Algorithm:',
            'size_header': 'SIZE',
            'name_header': 'NAME',
            'hint_default': 'Drag one or more files to this area',
            'hint_unsupported_type': 'Please drop files, not text or unsupported formats',
            'hint_unsupported_dir': 'Folders and empty files were skipped',
            'hint_drop': 'Release to calculate',
            'hint_error': 'An error occurred',
            'display_hint': '(Click hash to toggle format, right-click to copy)',
            'select_file': 'Select Files',
            'copy_success': 'Copied to clipboard',
            'language': '🌐 Language',
            'lang_zh': '中文',
            'lang_en': 'English',
            'lang_es': 'Español',
            'lang_fr': 'Français',
            'test_page': 'Test Hash-WASM'
        },
        'es': {
            'page_title': 'Comparador de Hash',
            'algo_label': 'Algoritmo Hash:',
            'size_header': 'TAMAÑO',
            'name_header': 'NOMBRE',
            'hint_default': 'Arrastre uno o más archivos a esta área',
            'hint_unsupported_type': 'Por favor arrastre archivos, no texto u otros formatos no soportados',
            'hint_unsupported_dir': 'Se omitieron carpetas y archivos vacíos',
            'hint_drop': 'Suelte para calcular',
            'hint_error': 'Ocurrió un error',
            'display_hint': '(Clic en hash para cambiar formato, clic derecho para copiar)',
            'select_file': 'Seleccionar Archivos',
            'copy_success': 'Copiado al portapapeles',
            'language': '🌐 Idioma',
            'lang_zh': '中文',
            'lang_en': 'English',
            'lang_es': 'Español',
            'lang_fr': 'Français',
            'test_page': 'Prueba Hash-WASM'
        },
        'fr': {
            'page_title': 'Comparateur de Hachage',
            'algo_label': 'Algorithme Hash:',
            'size_header': 'TAILLE',
            'name_header': 'NOM',
            'hint_default': 'Glissez un ou plusieurs fichiers dans cette zone',
            'hint_unsupported_type': 'Veuillez déposer des fichiers, pas du texte ou d\'autres formats non supportés',
            'hint_unsupported_dir': 'Les dossiers et fichiers vides ont été ignorés',
            'hint_drop': 'Relâchez pour calculer',
            'hint_error': 'Une erreur s\'est produite',
            'display_hint': '(Cliquez sur le hash pour changer le format, clic droit pour copier)',
            'select_file': 'Sélectionner des fichiers',
            'copy_success': 'Copié dans le presse-papiers',
            'language': '🌐 Langue',
            'lang_zh': '中文',
            'lang_en': 'English',
            'lang_es': 'Español',
            'lang_fr': 'Français',
            'test_page': 'Test Hash-WASM'
        }
    };

    // 支持的语言列表，第一个为默认语言
    const supportedLangs = ['zh', 'en', 'es', 'fr'];

    /**
     * 获取语言优先级：URL参数 > localStorage > 浏览器语言 > 默认中文
     */
    function detectLanguage() {
        // 1. 检查 URL 参数
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get('lang');
        if (langParam && supportedLangs.includes(langParam)) {
            return langParam;
        }

        // 2. 检查 localStorage
        const storedLang = localStorage.getItem('preferred_language');
        if (storedLang && supportedLangs.includes(storedLang)) {
            return storedLang;
        }

        // 3. 检查浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            const lang = browserLang.toLowerCase().split('-')[0];
            if (supportedLangs.includes(lang)) {
                return lang;
            }
        }

        // 4. 默认中文
        return supportedLangs[0];
    }

    // 当前语言 - 模块加载时立即检测，确保使用相关函数使用此变量时能拿到正确语言
    let currentLang = detectLanguage();

    /**
     * 翻译函数
     * @param {string} key - 翻译键
     * @returns {string} 翻译后的文本
     */
    function t(key) {
        const dict = translations[currentLang] || translations['zh'];
        return dict[key] || key;
    }

    /**
     * 翻译所有带有 data-i18n 属性的元素
     */
    function translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                el.textContent = t(key);
            }
        });

        // 翻译页面标题
        document.title = t('page_title');
    }

    /**
     * 切换语言
     * @param {string} lang - 目标语言代码
     */
    function switchLanguage(lang) {
        if (!supportedLangs.includes(lang)) {
            console.warn('Unsupported language:', lang);
            return;
        }

        // 保存到 localStorage
        localStorage.setItem('preferred_language', lang);

        // 更新 URL 参数
        const params = new URLSearchParams(window.location.search);
        params.set('lang', lang);
        const newURL = window.location.pathname + '?' + params.toString();
        window.history.replaceState({}, '', newURL);

        // 刷新页面以应用新语言（简化处理，确保所有 JS 常量重新加载）
        window.location.reload();
    }

    /**
     * 获取当前语言
     */
    function getCurrentLang() {
        return currentLang;
    }

    /**
     * 获取语言显示名称
     */
    function getLangDisplayName(lang) {
        return t('lang_' + lang) || lang;
    }

    /**
     * 创建语言选择菜单
     */
    function createLangMenu() {
        // 移除已存在的菜单
        const existingMenu = document.getElementById('lang-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const switcher = document.getElementById('lang-switcher');
        if (!switcher) return;

        const menu = document.createElement('div');
        menu.id = 'lang-menu';

        supportedLangs.forEach(lang => {
            const item = document.createElement('div');
            item.textContent = getLangDisplayName(lang);
            if (lang === currentLang) {
                item.style.background = 'var(--yellow, #FFD93D)';
            }
            item.addEventListener('mouseenter', () => {
                if (lang !== currentLang) {
                    item.style.background = 'var(--lavender, #c4b5fd)';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (lang !== currentLang) {
                    item.style.background = 'transparent';
                }
            });
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (lang !== currentLang) {
                    switchLanguage(lang);
                } else {
                    menu.remove();
                }
            });
            menu.appendChild(item);
        });

        // 定位菜单
        switcher.style.position = 'relative';
        switcher.appendChild(menu);

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!switcher.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    /**
     * 初始化 i18n
     */
    function init() {
        translatePage();

        // 更新语言切换器文本为当前语言名称
        const langSwitcher = document.getElementById('lang-switcher');
        if (langSwitcher) {
            langSwitcher.innerHTML = '🌐 ' + getLangDisplayName(currentLang);
            langSwitcher.style.cursor = 'pointer';
            langSwitcher.addEventListener('click', (e) => {
                e.stopPropagation();
                createLangMenu();
            });
        }
    }

    // 暴露全局 API
    window.i18n = {
        t: t,
        init: init,
        switchLanguage: switchLanguage,
        getCurrentLang: getCurrentLang
    };

    // 简写：全局 t 函数
    window.t = t;

    // DOM 加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
