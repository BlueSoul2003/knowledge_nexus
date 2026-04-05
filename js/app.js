import { initRPG, gainExp } from './core_rpg.js';
import { initStopwatch } from './tool_stopwatch.js';
import { initDAQ } from './tool_daq.js';
import { initInventory } from './core_inventory.js';
import { initSimulation, physicsState } from './sim_pendulum.js';
import { initLabs } from './ui_labs.js';

// --- 更新：無痕多國語言翻譯模組 (Headless Wrapper Pattern 修正版) ---
function initTranslator() {
    // 1. 建立完全符合我們 UI 風格的自訂下拉選單
    const translateContainer = document.createElement('div');
    translateContainer.className = 'fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md border border-slate-600 px-4 py-2.5 rounded-full shadow-lg hover:border-indigo-500 transition-colors cursor-pointer';
    
    // 使用 Tailwind 打造我們自己的 UI
    translateContainer.innerHTML = `
        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
        <select id="custom-lang-selector" class="bg-transparent text-slate-200 text-sm font-medium outline-none cursor-pointer appearance-none text-center">
            <option value="zh-TW" class="bg-slate-800">繁體中文</option>
            <option value="ms" class="bg-slate-800">Bahasa Melayu</option>
            <option value="en" class="bg-slate-800">English</option>
        </select>
        <!-- 修正關鍵：絕不能用 display:none。我們將其推到畫面外，確保 Google 會順利渲染它 -->
        <div id="google_translate_element" style="position: absolute; left: -9999px; z-index: -1; opacity: 0;"></div>
    `;
    document.body.appendChild(translateContainer);

    // 2. CSS 徹底封殺 Google 的痕跡 (頂部橫幅、提示框、高亮)，同時保留 KaTeX 保護
    const style = document.createElement('style');
    style.innerHTML = `
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        .katex, .katex-display { translate: no; }
    `;
    document.head.appendChild(style);

    // 3. Google Translate 初始化
    window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
            pageLanguage: 'zh-TW', 
            includedLanguages: 'zh-TW,en,ms', 
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    // 4. 載入腳本
    const script = document.createElement('script');
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);

    // 5. 核心魔法：橋接自訂選單與隱藏的 Google 選單
    const customSelector = document.getElementById('custom-lang-selector');
    customSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        const googleSelect = document.querySelector('.goog-te-combo');
        
        if (googleSelect) {
            googleSelect.value = lang;
            // 修正關鍵：必須開啟 bubbles (事件冒泡)，否則 Google 的 React/Vanilla 監聽器抓不到這個改變
            googleSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        } else {
            console.warn("Google Translate widget is not ready yet.");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("FP Physics 系統啟動...");

    // 啟動無痕多國語言翻譯模組
    initTranslator();

    // 1. 初始化 RPG 系統
    initRPG({
        levelText: document.getElementById('player-level'),
        expFill: document.getElementById('player-exp-fill'),
        expText: document.getElementById('player-exp-text')
    });

    // 2. 初始化測量工具與 DAQ
    initStopwatch(
        document.getElementById('stopwatch-display'),
        document.getElementById('btn-sw-toggle'),
        document.getElementById('btn-sw-reset')
    );
    initDAQ({
        btnRecord: document.getElementById('btn-record'),
        btnExport: document.getElementById('btn-export'),
        counter: document.getElementById('data-counter')
    });

    // 3. 初始化圖鑑 (傳入 gainExp 讓收集公式時可以給經驗值)
    initInventory({
        btnToggle: document.getElementById('btn-inventory-toggle'),
        btnClose: document.getElementById('btn-inventory-close'),
        panel: document.getElementById('inventory-panel'),
        list: document.getElementById('inventory-list'),
        badge: document.getElementById('inventory-badge')
    }, gainExp);

    // 4. 初始化物理引擎核心
    initSimulation('simCanvas');

    // 5. 初始化實驗手冊面板 (傳入 physicsState 讓實驗腳本有權限強制修改重力/阻尼)
    initLabs({
        btnToggle: document.getElementById('btn-lab-toggle'),
        btnClose: document.getElementById('btn-lab-close'),
        panel: document.getElementById('lab-panel'),
        selector: document.getElementById('lab-selector'),
        contentArea: document.getElementById('lab-content-area'),
        title: document.getElementById('lab-title'),
        desc: document.getElementById('lab-desc'),
        steps: document.getElementById('lab-steps'),
        tip: document.getElementById('lab-tip'),
        formulaContainer: document.getElementById('lab-formula-container')
    }, physicsState);

    // 6. 綁定控制台滑塊與按鈕，讓 UI 能夠控制物理引擎
    document.getElementById('slider-length').addEventListener('input', (e) => {
        physicsState.setLength(parseFloat(e.target.value));
        document.getElementById('val-length').innerText = e.target.value + ' m';
    });
    
    document.getElementById('slider-mass').addEventListener('input', (e) => {
        physicsState.setMass(parseFloat(e.target.value));
        document.getElementById('val-mass').innerText = e.target.value + ' kg';
    });
    
    document.getElementById('slider-gravity').addEventListener('input', (e) => {
        physicsState.setGravity(parseFloat(e.target.value));
        document.getElementById('val-gravity').innerText = e.target.value + ' m/s²';
    });
    
    document.getElementById('slider-damping').addEventListener('input', (e) => {
        physicsState.setDamping(parseFloat(e.target.value));
        document.getElementById('val-damping').innerText = e.target.value;
    });

    // 角度尺 (Protractor) 開關特效與邏輯
    document.getElementById('toggle-protractor').addEventListener('change', (e) => {
        physicsState.setShowProtractor(e.target.checked);
        const bg = document.getElementById('protractor-bg');
        const dot = document.getElementById('protractor-dot');
        if (e.target.checked) {
            bg.classList.replace('bg-slate-700', 'bg-emerald-500');
            dot.style.transform = 'translateX(100%)';
        } else {
            bg.classList.replace('bg-emerald-500', 'bg-slate-700');
            dot.style.transform = 'translateX(0)';
        }
    });

    // 右側控制台開關邏輯
    document.getElementById('btn-panel-toggle').addEventListener('click', () => {
        document.getElementById('control-panel').classList.toggle('panel-hidden');
        // 手機版互斥顯示：打開右邊時自動隱藏左邊
        if (window.innerWidth < 768 && !document.getElementById('control-panel').classList.contains('panel-hidden')) {
            document.getElementById('lab-panel').classList.add('lab-hidden');
        }
    });

    // 暫停與重置按鈕
    const btnToggle = document.getElementById('btn-toggle');
    btnToggle.addEventListener('click', () => {
        let isPaused = physicsState.togglePause();
        btnToggle.innerText = isPaused ? "繼續 (Resume)" : "暂停 (Pause)";
        btnToggle.className = isPaused ? "btn bg-emerald-500 hover:bg-emerald-600" : "btn bg-blue-500 hover:bg-blue-600";
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        physicsState.reset();
        // 如果目前是暫停狀態，重置時自動恢復播放
        if (btnToggle.innerText === "繼續 (Resume)") btnToggle.click(); 
    });

    // 7. 監聽物理引擎每幀發出的事件，即時更新能量柱狀圖
    window.addEventListener('physicsUpdate', (e) => {
        const { ke, pe, te, max } = e.detail;
        document.getElementById('bar-ke').style.height = `${Math.min(100, (ke / max) * 100)}%`;
        document.getElementById('bar-pe').style.height = `${Math.min(100, (pe / max) * 100)}%`;
        document.getElementById('bar-te').style.height = `${Math.min(100, (te / max) * 100)}%`;
        document.getElementById('energy-text').innerText = `KE: ${ke.toFixed(1)}J | PE: ${pe.toFixed(1)}J | TE: ${te.toFixed(1)}J`;
    });
});