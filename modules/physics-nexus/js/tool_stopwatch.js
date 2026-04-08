// js/tool_stopwatch.js

let stopwatchRunning = false;
let stopwatchTime = 0;
let displayElement = null;

export function initStopwatch(displayEl, toggleBtn, resetBtn) {
    displayElement = displayEl;

    toggleBtn.addEventListener('click', () => {
        stopwatchRunning = !stopwatchRunning;
        toggleBtn.innerText = stopwatchRunning ? "暫停 (Stop)" : "啟動 (Start)";
        toggleBtn.className = stopwatchRunning ? "btn !bg-amber-600 hover:!bg-amber-500 flex-1 !mb-0 text-xs" : "btn !bg-slate-700 hover:!bg-slate-600 flex-1 !mb-0 text-xs";
    });

    resetBtn.addEventListener('click', () => {
        stopwatchTime = 0;
        updateDisplay();
    });
}

// 物理引擎每次更新時呼叫這個，dt 是時間步長
export function tickStopwatch(dt) {
    if (stopwatchRunning) {
        stopwatchTime += dt;
        updateDisplay();
    }
}

function updateDisplay() {
    if (!displayElement) return;
    let mins = Math.floor(stopwatchTime / 60);
    let secs = Math.floor(stopwatchTime % 60);
    let ms = Math.floor((stopwatchTime % 1) * 100);
    displayElement.innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}