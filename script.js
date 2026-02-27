const MAX_HISTORY_ITEMS = 30;
const LANGUAGE_STORAGE_KEY = 'blueprintLanguage';
const HISTORY_STORAGE_KEY = 'blueprintHistory';

let blueprintHistory = [];
let jsonEditor;
let searchCursor;
let currentLanguage = 'ru';

const dom = {};

const LANGUAGE_LABELS = {
    ru: 'Русский',
    en: 'English',
    uk: 'Українська',
    kk: 'Қазақша',
    cs: 'Čeština',
    nl: 'Nederlands',
    sv: 'Svenska',
    de: 'Deutsch',
    pl: 'Polski',
    fr: 'Français',
    zh: '中文',
    ja: '日本語'
};


function t(key) {
    const dictionary = (window.BP_TRANSLATIONS && window.BP_TRANSLATIONS[currentLanguage]) || {};
    const fallback = (window.BP_TRANSLATIONS && window.BP_TRANSLATIONS.ru) || {};
    return dictionary[key] || fallback[key] || key;
}

function setLanguage(language) {
    if (!window.BP_TRANSLATIONS || !window.BP_TRANSLATIONS[language]) {
        return;
    }

    currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
        node.textContent = t(node.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
        node.placeholder = t(node.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((node) => {
        node.innerHTML = t(node.dataset.i18nHtml);
    });

    if (dom.languageToggle) {
        dom.languageToggle.textContent = LANGUAGE_LABELS[language] || language.toUpperCase();
    }

    updateHistoryDisplay();

    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
        console.log('LocalStorage not available:', error);
    }
}

function addToHistory(blueprint) {
    if (!blueprint || blueprintHistory.includes(blueprint)) {
        return;
    }

    blueprintHistory.unshift(blueprint);
    if (blueprintHistory.length > MAX_HISTORY_ITEMS) {
        blueprintHistory.pop();
    }

    updateHistoryDisplay();

    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(blueprintHistory));
    } catch (error) {
        console.log('LocalStorage not available:', error);
    }
}

function updateHistoryDisplay() {
    dom.historyItems.innerHTML = '';

    blueprintHistory.forEach((blueprint, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = `${blueprint.slice(0, 10)}...`;
        item.title = `${t('historyRestoreTitle')} #${index + 1}`;
        item.addEventListener('click', () => restoreFromHistory(blueprint));
        dom.historyItems.appendChild(item);
    });

    if (blueprintHistory.length === 0) {
        const empty = document.createElement('span');
        empty.textContent = t('historyEmpty');
        empty.style.color = '#888';
        dom.historyItems.appendChild(empty);
    }
}

function clearHistory() {
    blueprintHistory = [];
    try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
        console.log('LocalStorage not available:', error);
    }
    updateHistoryDisplay();
}

function restoreFromHistory(blueprint) {
    dom.blueprintInput.value = blueprint;
    adjustFontSize(dom.blueprintInput);
    decodeBlueprint();
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
            blueprintHistory = JSON.parse(saved);
        }
    } catch (error) {
        console.log('LocalStorage not available:', error);
    }
    updateHistoryDisplay();
}

function adjustFontSize(element) {
    const contentLength = element.value.length;
    let fontSize = 14;

    if (contentLength > 5000) fontSize = 10;
    else if (contentLength > 2500) fontSize = 11;
    else if (contentLength > 1000) fontSize = 12;
    else if (contentLength > 500) fontSize = 13;

    element.style.fontSize = `${fontSize}px`;
}

function clearSearchHighlights() {
    jsonEditor.getAllMarks().forEach((mark) => mark.clear());
}

function searchInJson() {
    clearSearchHighlights();
    const searchTerm = dom.searchInput.value.trim();

    if (!searchTerm) {
        searchCursor = null;
        return;
    }

    searchCursor = jsonEditor.getSearchCursor(searchTerm, { line: 0, ch: 0 }, { caseFold: true });
    findNext();
}

function selectCursorResult() {
    jsonEditor.setSelection(searchCursor.from(), searchCursor.to());
    jsonEditor.scrollIntoView({ from: searchCursor.from(), to: searchCursor.to() }, 50);
}

function findNext() {
    if (!searchCursor) {
        return;
    }

    if (searchCursor.findNext()) {
        selectCursorResult();
        return;
    }

    searchCursor = jsonEditor.getSearchCursor(searchCursor.query, { line: 0, ch: 0 }, { caseFold: true });
    if (searchCursor.findNext()) {
        selectCursorResult();
    } else {
        alert(t('matchesNotFound'));
    }
}

function findPrev() {
    if (!searchCursor) {
        return;
    }

    if (searchCursor.findPrevious()) {
        selectCursorResult();
        return;
    }

    const lastLine = jsonEditor.lastLine();
    const lastCh = jsonEditor.getLine(lastLine).length;
    searchCursor = jsonEditor.getSearchCursor(searchCursor.query, { line: lastLine, ch: lastCh }, { caseFold: true });

    if (searchCursor.findPrevious()) {
        selectCursorResult();
    } else {
        alert(t('matchesNotFound'));
    }
}

function toggleReplaceUI() {
    dom.replaceContainer.style.display = dom.replaceContainer.style.display === 'block' ? 'none' : 'block';
}

function replaceAll() {
    const findText = dom.replaceInput.value;
    const replaceWithText = dom.replaceWithInput.value;

    if (!findText) {
        alert(t('replaceEnterText'));
        return;
    }

    const escapedFindText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const currentCode = jsonEditor.getValue();
    const newCode = currentCode.replace(new RegExp(escapedFindText, 'g'), replaceWithText);

    if (currentCode === newCode) {
        alert(t('replaceNotFound'));
    } else {
        jsonEditor.setValue(newCode);
        alert(t('replaceDone'));
    }
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}

function decodeBlueprint() {
    try {
        const blueprint = dom.blueprintInput.value.trim();

        if (!blueprint) {
            alert(t('enterBlueprint'));
            return;
        }

        addToHistory(blueprint);

        const base64 = blueprint.startsWith('0') ? blueprint.slice(1) : blueprint;
        const byteArray = base64ToUint8Array(base64);
        const jsonString = pako.inflate(byteArray, { to: 'string' });
        const json = JSON.parse(jsonString);

        jsonEditor.setValue(JSON.stringify(json, null, 2));
        adjustFontSize(dom.blueprintInput);
        encodeBlueprintPreview(json);
    } catch (error) {
        console.error('Blueprint decoding error:', error);
        alert(`${t('decodeFailed')} ${error.message}`);
    }
}

function encodeBlueprintPreview(json) {
    try {
        const compressed = pako.deflate(JSON.stringify(json));
        const base64 = btoa(String.fromCharCode.apply(null, compressed));
        dom.encodedOutput.value = `0${base64}`;
        adjustFontSize(dom.encodedOutput);
    } catch (error) {
        dom.encodedOutput.value = `${t('encodingError')} ${error.message}`;
    }
}

function encodeJson() {
    try {
        const jsonText = jsonEditor.getValue();
        if (!jsonText.trim()) {
            alert(t('jsonEditorEmpty'));
            return;
        }

        const json = JSON.parse(jsonText);
        encodeBlueprintPreview(json);
        jsonEditor.setValue(JSON.stringify(json, null, 2));
    } catch (error) {
        alert(`${t('encodeError')} ${error.message}`);
    }
}

function copyEncodedBlueprint() {
    if (!dom.encodedOutput.value) {
        return;
    }

    navigator.clipboard.writeText(dom.encodedOutput.value).then(() => {
        const originalText = dom.copyEncodedBtn.textContent;
        dom.copyEncodedBtn.textContent = t('copied');
        setTimeout(() => {
            dom.copyEncodedBtn.textContent = originalText;
        }, 1500);
    });
}

function clearBlueprint() {
    dom.blueprintInput.value = '';
}

function bindEvents() {
    dom.decodeBtn.addEventListener('click', decodeBlueprint);
    dom.clearBlueprintBtn.addEventListener('click', clearBlueprint);
    dom.encodeBtn.addEventListener('click', encodeJson);
    dom.copyEncodedBtn.addEventListener('click', copyEncodedBlueprint);
    dom.searchBtn.addEventListener('click', searchInJson);
    dom.findNextBtn.addEventListener('click', findNext);
    dom.findPrevBtn.addEventListener('click', findPrev);
    dom.toggleReplaceBtn.addEventListener('click', toggleReplaceUI);
    dom.replaceAllBtn.addEventListener('click', replaceAll);
    dom.clearHistoryBtn.addEventListener('click', clearHistory);

    dom.blueprintInput.addEventListener('input', () => adjustFontSize(dom.blueprintInput));
    dom.searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchInJson();
        }
    });

    dom.languageToggle.addEventListener('click', () => {
        dom.languageMenu.classList.toggle('hidden');
    });

    dom.languageOptions.addEventListener('click', (event) => {
        const option = event.target.closest('button[data-language]');
        if (!option) {
            return;
        }

        setLanguage(option.dataset.language);
        dom.languageMenu.classList.add('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!dom.languageMenu.contains(event.target) && !dom.languageToggle.contains(event.target)) {
            dom.languageMenu.classList.add('hidden');
        }
    });
}

function cacheDom() {
    dom.historyItems = document.getElementById('historyItems');
    dom.blueprintInput = document.getElementById('blueprintInput');
    dom.encodedOutput = document.getElementById('encodedOutput');
    dom.searchInput = document.getElementById('searchInput');
    dom.replaceContainer = document.getElementById('replaceContainer');
    dom.replaceInput = document.getElementById('replaceInput');
    dom.replaceWithInput = document.getElementById('replaceWithInput');
    dom.decodeBtn = document.getElementById('decodeBtn');
    dom.clearBlueprintBtn = document.getElementById('clearBlueprintBtn');
    dom.encodeBtn = document.getElementById('encodeBtn');
    dom.copyEncodedBtn = document.getElementById('copyEncodedBtn');
    dom.searchBtn = document.getElementById('searchBtn');
    dom.findNextBtn = document.getElementById('findNextBtn');
    dom.findPrevBtn = document.getElementById('findPrevBtn');
    dom.toggleReplaceBtn = document.getElementById('toggleReplaceBtn');
    dom.replaceAllBtn = document.getElementById('replaceAllBtn');
    dom.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    dom.languageToggle = document.getElementById('languageToggle');
    dom.languageMenu = document.getElementById('languageMenu');
    dom.languageOptions = document.getElementById('languageOptions');
}

function renderLanguageOptions() {
    dom.languageOptions.innerHTML = '';

    Object.entries(LANGUAGE_LABELS).forEach(([code, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'language-option';
        button.dataset.language = code;
        button.textContent = label;
        dom.languageOptions.appendChild(button);
    });
}

function initEditor() {
    jsonEditor = CodeMirror(document.getElementById('jsonEditorContainer'), {
        mode: { name: 'javascript', json: true },
        theme: 'material-darker',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true,
        gutters: ['CodeMirror-linenumbers'],
        highlightSelectionMatches: {
            showToken: /\w/,
            annotateScrollbar: true
        }
    });

    jsonEditor.setSize(null, 'auto');
    jsonEditor.refresh();
}

window.addEventListener('load', () => {
    cacheDom();
    renderLanguageOptions();
    initEditor();
    bindEvents();
    loadHistory();
    adjustFontSize(dom.blueprintInput);

    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ru';
    setLanguage(savedLanguage);

    decodeBlueprint();
});
