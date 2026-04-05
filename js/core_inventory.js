// js/core_inventory.js

let collectedFormulas = JSON.parse(localStorage.getItem('fp_physics_formulas') || '{}');
let ui = {};
let onCollectCallback = null; // 用來觸發 RPG 經驗值

export function initInventory(elements, collectCallback) {
    ui = elements;
    onCollectCallback = collectCallback;

    ui.btnToggle.addEventListener('click', () => ui.panel.classList.toggle('inventory-hidden'));
    ui.btnClose.addEventListener('click', () => ui.panel.classList.add('inventory-hidden'));

    // 將 collectFormula 暴露給全域 (因為 HTML 裡寫了 onclick="collectFormula(...)")
    window.collectFormula = handleCollectFormula;
    
    updateInventoryUI();
}

function updateInventoryUI() {
    if (!ui.list || !ui.badge) return;
    const ids = Object.keys(collectedFormulas);
    ui.badge.innerText = ids.length;
    
    if (ids.length === 0) {
        ui.list.innerHTML = `<div class="text-center text-slate-500 text-sm py-4">圖鑑空空如也，去實驗中完成任務收集吧！</div>`;
        return;
    }

    ui.list.innerHTML = '';
    ids.forEach(id => {
        const f = collectedFormulas[id];
        const div = document.createElement('div');
        div.className = "bg-slate-800 border border-slate-600 rounded-lg p-3 group transition-colors hover:border-amber-500/50";
        div.innerHTML = `
            <div class="text-xs font-bold text-amber-400 mb-2 flex justify-between items-center">
                <span>${f.name}</span>
                <span class="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">已解鎖</span>
            </div>
            <div id="inv-katex-${id}" class="text-center text-white overflow-x-auto py-2"></div>
            <div class="mt-2 pt-2 border-t border-slate-700">
                <p class="text-[11px] text-slate-400 leading-relaxed text-justify">
                    <span class="text-indigo-400 font-semibold">📖 歷史檔案：</span>${f.history}
                </p>
            </div>
        `;
        ui.list.appendChild(div);
        
        // 使用 try-catch 確保 KaTeX 載入失敗時不會導致整個畫面崩潰
        try {
            if (window.katex) {
                katex.render(f.latex, div.querySelector(`#inv-katex-${id}`), { throwOnError: false, displayMode: true });
            }
        } catch (e) {
            console.error("KaTeX rendering failed", e);
        }
    });
}

function handleCollectFormula(id, name, latex, history, event) {
    const card = document.getElementById(`formula-card-${id}`);
    if(card) card.classList.add('formula-collected');
    
    if (onCollectCallback) {
        onCollectCallback(50, event.clientX, event.clientY);
    }
    
    if (!collectedFormulas[id]) {
        collectedFormulas[id] = { name: name, latex: latex, history: decodeURIComponent(history) };
        localStorage.setItem('fp_physics_formulas', JSON.stringify(collectedFormulas));
        updateInventoryUI();
        
        ui.btnToggle.classList.add('scale-110', 'bg-slate-700', 'shadow-amber-500/50');
        setTimeout(() => ui.btnToggle.classList.remove('scale-110', 'bg-slate-700', 'shadow-amber-500/50'), 300);
    }
}
