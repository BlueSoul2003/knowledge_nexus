// js/tool_daq.js

let isRecording = false;
let dataLog = [];
let timeSinceLastRecord = 0;
const RECORD_RATE = 0.05; // 20Hz 採樣率

let ui = { btnRecord: null, btnExport: null, counter: null };

export function initDAQ(elements) {
    ui = elements;

    ui.btnRecord.addEventListener('click', () => {
        isRecording = !isRecording;
        if (isRecording) {
            dataLog = [];
            timeSinceLastRecord = 0;
            ui.btnRecord.innerText = "⏹ 停止錄製";
            ui.btnRecord.className = "btn btn-recording flex-1 !mb-0 text-sm";
            ui.btnExport.disabled = true;
            ui.counter.innerText = `已記錄: 0 筆資料`;
        } else {
            ui.btnRecord.innerText = "🔴 開始錄製";
            ui.btnRecord.className = "btn btn-record flex-1 !mb-0 text-sm";
        }
    });

    ui.btnExport.addEventListener('click', exportToCSV);
}

// 物理引擎呼叫這個來嘗試記錄資料
export function recordDataPoint(dt, simTime, theta, omega, ke, pe, te) {
    if (!isRecording) return;
    
    timeSinceLastRecord += dt;
    if (timeSinceLastRecord >= RECORD_RATE) {
        dataLog.push({ t: simTime, theta: theta, omega: omega, ke: ke, pe: pe, te: te });
        timeSinceLastRecord = 0;
        ui.counter.innerText = `已記錄: ${dataLog.length} 筆資料`;
        if (dataLog.length > 0) ui.btnExport.disabled = false;
    }
}

function exportToCSV() {
    if (dataLog.length === 0) return;
    
    let csvContent = "Time(s),Angle(rad),AngularVelocity(rad/s),KineticEnergy(J),PotentialEnergy(J),TotalEnergy(J)\n";
    dataLog.forEach(row => {
        csvContent += `${row.t.toFixed(3)},${row.theta.toFixed(4)},${row.omega.toFixed(4)},${row.ke.toFixed(4)},${row.pe.toFixed(4)},${row.te.toFixed(4)}\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pendulum_data_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
