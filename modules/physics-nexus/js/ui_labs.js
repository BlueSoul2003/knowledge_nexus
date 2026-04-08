export function initLabs(ui, physicsState) {
    let currentLab = 0;

    // 面板開關邏輯
    ui.btnToggle.addEventListener('click', () => {
        ui.panel.classList.toggle('lab-hidden');
        if (window.innerWidth < 768 && !ui.panel.classList.contains('lab-hidden')) {
            document.getElementById('control-panel').classList.add('panel-hidden'); 
        }
    });
    ui.btnClose.addEventListener('click', () => ui.panel.classList.add('lab-hidden'));

    const labData = {
        1: {
            title: "🪐 測量未知星球重力",
            desc: "你已登陸一顆未知星球。單擺週期公式為 T = 2π√(L/g)。請透過測量不同擺長下的週期，反推該星球的真實重力加速度。",
            formula: {
                id: 'pendulum_period',
                name: '理想單擺週期公式',
                latex: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
                history: '傳說 1583 年，年輕的伽利略在比薩大教堂觀察吊燈搖晃，發現無論擺幅大小，來回一次的時間似乎都相同（單擺等時性）。這啟發了荷蘭物理學家惠更斯發明了極度精準的擺鐘，徹底改變了人類航海與測量時間的歷史！'
            },
            tip: "將匯出的 CSV 放入 Excel，找到波形最高點之間的時間差即為週期 T。繪製 T² 對 L 的關係圖，其斜率為 4π²/g。",
            steps: [
                "將阻尼 (Damping) 設為 0 以減少誤差",
                "將擺長 (Length) 設為 1.0 m",
                "打開測量工具，拉至準確的 10° 內並釋放",
                "使用秒錶計時 10 次完整擺動的時間",
                "開啟 DAQ 錄製數據並匯出 CSV 做驗證"
            ],
            onStart: () => {
                physicsState.setGravity(3.72);
                const s_gravity = document.getElementById('slider-gravity');
                const val_gravity = document.getElementById('val-gravity');
                s_gravity.value = 3.72;
                s_gravity.disabled = true;
                val_gravity.innerText = "??? m/s²";
                val_gravity.classList.add('text-red-400', 'font-bold');
            },
            onEnd: () => {
                const s_gravity = document.getElementById('slider-gravity');
                const val_gravity = document.getElementById('val-gravity');
                s_gravity.disabled = false;
                val_gravity.classList.remove('text-red-400', 'font-bold');
                let g = parseFloat(s_gravity.value);
                physicsState.setGravity(g);
                val_gravity.innerText = g.toFixed(2) + ' m/s²';
            }
        },
        2: {
            title: "📐 大角度非線性修正",
            desc: "課本常說單擺週期與角度無關，但這僅限於小角度近似。讓我們來挑戰極限，觀察大角度下的真實物理現象！",
            formula: {
                id: 'pendulum_large_angle',
                name: '大角度週期修正 (泰勒展開)',
                latex: 'T \\approx 2\\pi\\sqrt{\\frac{L}{g}}\\left(1 + \\frac{1}{16}\\theta_0^2 + \\dots \\right)',
                history: '中學課本常把世界簡化為「線性系統」。但真實世界充滿了非線性！當擺動角度變大時，必須引入「第一類完全橢圓積分」才能精確求解。這提醒我們：線性模型通常只是微小擾動下的一個完美近似。'
            },
            tip: "比較 10 度和 90 度的 CSV 數據，你會發現大角度的週期明顯變長了。這正是我們自研 RK4 引擎比普通遊戲引擎精準的證明！",
            steps: [
                "確保阻尼 (Damping) 設為 0",
                "將擺球拉至微小角度 (約 10 度)，錄製並匯出",
                "將擺球拉至水平 (90 度)，錄製並匯出",
                "將擺球拉至接近頂部 (160 度)，錄製並匯出",
                "在 Excel 中並排比較這三組數據的週期 T"
            ],
            onStart: () => {}, onEnd: () => {}
        },
        3: {
            title: "📉 阻尼與能量耗散",
            desc: "現實中的系統總是伴隨能量散失。觀察空氣阻力如何消耗系統的總機械能，並尋找其數學規律。",
            formula: {
                id: 'energy_damping',
                name: '阻尼衰減方程式',
                latex: 'E(t) = E_0 e^{-\\gamma t}',
                history: '能量不會憑空消失，它只是轉換了形式。空氣阻力將單擺宏觀的機械能，轉化為了微觀空氣分子的熱能（熱力學第二定律的熵增現象）。在電子學中，這與 RLC 電路裡電阻 (R) 消耗電能的數學模型如出一轍！'
            },
            tip: "在 Excel 中繪製「總能 (TotalEnergy)」對「時間 (Time)」的圖表，並嘗試添加『指數趨勢線』。這與電子學中的 RLC 電路衰減方程式極為相似！",
            steps: [
                "將空氣阻力 (Damping) 設為 0.2",
                "將擺球拉至水平 90 度",
                "點擊開始錄製，並釋放擺球",
                "觀察右側「總能 TE」柱狀圖的實時下降現象",
                "錄製至少 20 秒後匯出數據"
            ],
            onStart: () => {
                physicsState.setDamping(0.2);
                document.getElementById('slider-damping').value = 0.2;
                document.getElementById('val-damping').innerText = "0.20";
            },
            onEnd: () => {}
        }
    };

    ui.selector.addEventListener('change', (e) => {
        const labId = parseInt(e.target.value);
        if (currentLab !== 0 && labData[currentLab].onEnd) labData[currentLab].onEnd();
        
        currentLab = labId;
        physicsState.reset(); 
        document.getElementById('btn-reset').click(); 
        
        if (labId === 0) {
            ui.contentArea.classList.add('hidden');
            return;
        }
        
        const lab = labData[labId];
        ui.title.innerText = lab.title;
        ui.desc.innerText = lab.desc;
        ui.tip.innerText = lab.tip;
        
        ui.steps.innerHTML = '';
        lab.steps.forEach((step, index) => {
            ui.steps.innerHTML += `<label class="lab-step"><input type="checkbox" id="step-${index}"><span>${step}</span></label>`;
        });
        
        ui.formulaContainer.innerHTML = '';
        let collected = JSON.parse(localStorage.getItem('fp_physics_formulas') || '{}');
        if (lab.formula && !collected[lab.formula.id]) {
            const safeHistory = encodeURIComponent(lab.formula.history);
            ui.formulaContainer.innerHTML = `
                <div id="formula-card-${lab.formula.id}" class="formula-card group relative bg-slate-800 border border-slate-600 rounded-xl p-4 mb-2 cursor-pointer overflow-hidden" onclick="window.collectFormula('${lab.formula.id}', '${lab.formula.name}', '${lab.formula.latex.replace(/\\/g, '\\\\')}', '${safeHistory}', event)">
                    <div class="absolute top-2 right-2 text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </div>
                    <div class="text-xs font-semibold text-indigo-400 mb-2">${lab.formula.name}</div>
                    <div id="katex-container-${lab.formula.id}" class="flex justify-center my-2 text-white"></div>
                    <div class="text-[10px] text-slate-500 text-center mt-2 group-hover:text-indigo-300 transition-colors">✨ 點擊以收集並獲得 XP！</div>
                </div>
            `;
            setTimeout(() => { if(window.katex) katex.render(lab.formula.latex, document.getElementById(`katex-container-${lab.formula.id}`), { throwOnError: false, displayMode: true }); }, 10);
        } else if (lab.formula && collected[lab.formula.id]) {
            ui.formulaContainer.innerHTML = `
                <div class="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 mb-2 flex items-center justify-between">
                    <span class="text-xs text-indigo-300">✅ 已解鎖：${lab.formula.name}</span>
                    <span class="text-xs text-slate-500 border border-slate-600 px-2 rounded-full cursor-pointer hover:bg-slate-800" onclick="document.getElementById('btn-inventory-toggle').click()">查看圖鑑</span>
                </div>
            `;
        }

        ui.contentArea.classList.remove('hidden');
        if (lab.onStart) lab.onStart();
    });
}