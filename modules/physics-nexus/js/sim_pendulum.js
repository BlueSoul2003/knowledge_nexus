import { tickStopwatch } from './tool_stopwatch.js';
import { recordDataPoint } from './tool_daq.js';

let canvas, ctx;
let L = 1.5, m = 1.0, g = 9.81, damping = 0.05;
let theta = Math.PI / 4, omega = 0;
let PIXELS_PER_METER = 200;
let pivot = { x: 0, y: 0 };
let isPaused = false, isDragging = false, isDraggingPivot = false;
let trace = [];
let simTime = 0;
const dt = 1/60;
let showProtractor = false;

export const physicsState = {
    setLength: (val) => { L = val; trace = []; },
    setMass: (val) => { m = val; },
    setGravity: (val) => { g = val; },
    setDamping: (val) => { damping = val; },
    setShowProtractor: (val) => { showProtractor = val; },
    getEnergy: () => {
        let h = L * (1 - Math.cos(theta));
        let PE = m * g * h;
        let KE = 0.5 * m * (L * omega) * (L * omega);
        return { pe: PE, ke: KE, te: PE + KE, max: m * g * 2.5 * 2 }; 
    },
    togglePause: () => { isPaused = !isPaused; return isPaused; },
    reset: () => { theta = Math.PI / 4; omega = 0; trace = []; simTime = 0; }
};

export function initSimulation(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d', { alpha: false });
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        pivot.x = canvas.width / 2;
        pivot.y = canvas.height * 0.15; 
        PIXELS_PER_METER = Math.min(200, canvas.height * 0.4 / 2.5); 
    }
    window.addEventListener('resize', resize);
    resize();
    setupInteraction();
    requestAnimationFrame(animate);
}

function getAlpha(currentTheta, currentOmega) {
    return -(g / L) * Math.sin(currentTheta) - (damping / m) * currentOmega;
}

function updatePhysics() {
    if (isPaused || isDragging || isDraggingPivot) return;
    simTime += dt;

    let k1_theta = omega;
    let k1_omega = getAlpha(theta, omega);
    let k2_theta = omega + 0.5 * dt * k1_omega;
    let k2_omega = getAlpha(theta + 0.5 * dt * k1_theta, omega + 0.5 * dt * k1_omega);
    let k3_theta = omega + 0.5 * dt * k2_omega;
    let k3_omega = getAlpha(theta + 0.5 * dt * k2_theta, omega + 0.5 * dt * k2_omega);
    let k4_theta = omega + dt * k3_omega;
    let k4_omega = getAlpha(theta + dt * k3_theta, omega + dt * k3_omega);

    theta += (dt / 6) * (k1_theta + 2 * k2_theta + 2 * k3_theta + k4_theta);
    omega += (dt / 6) * (k1_omega + 2 * k2_omega + 2 * k3_omega + k4_omega);

    let bobX = pivot.x + L * PIXELS_PER_METER * Math.sin(theta);
    let bobY = pivot.y + L * PIXELS_PER_METER * Math.cos(theta);
    trace.push({x: bobX, y: bobY});
    if (trace.length > 50) trace.shift();

    tickStopwatch(dt);
    let energy = physicsState.getEnergy();
    recordDataPoint(dt, simTime, theta, omega, energy.ke, energy.pe, energy.te);
}

function draw() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.beginPath();
    for(let i=0; i<canvas.width; i+=PIXELS_PER_METER/2) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
    for(let i=0; i<canvas.height; i+=PIXELS_PER_METER/2) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
    ctx.stroke();

    let bobX = pivot.x + L * PIXELS_PER_METER * Math.sin(theta);
    let bobY = pivot.y + L * PIXELS_PER_METER * Math.cos(theta);

    if (trace.length > 1) {
        ctx.beginPath(); ctx.moveTo(trace[0].x, trace[0].y);
        for (let i = 1; i < trace.length; i++) ctx.lineTo(trace[i].x, trace[i].y);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.beginPath(); ctx.moveTo(pivot.x, pivot.y); ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.stroke();

    // 繪製全息角度尺
    if (showProtractor) {
        ctx.save();
        ctx.translate(pivot.x, pivot.y);
        ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI, false);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI, false);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "11px monospace";
        for (let angle = -90; angle <= 90; angle += 10) {
            let rad = angle * Math.PI / 180;
            let x1 = 140 * Math.sin(rad), y1 = 140 * Math.cos(rad);
            let x2 = 150 * Math.sin(rad), y2 = 150 * Math.cos(rad);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            let isMajor = (angle % 30 === 0);
            ctx.strokeStyle = isMajor ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = isMajor ? 2 : 1; ctx.stroke();
            if (isMajor) {
                let tx = 165 * Math.sin(rad), ty = 165 * Math.cos(rad);
                ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
                ctx.fillText(Math.abs(angle) + "°", tx, ty);
            }
        }
        let currentDeg = (theta * 180 / Math.PI).toFixed(1);
        let cx = 150 * Math.sin(theta), cy = 150 * Math.cos(theta);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, cy);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f59e0b'; ctx.font = "bold 14px monospace";
        ctx.fillText(currentDeg + "°", cx * 0.7, cy * 0.7);
        ctx.restore();
    }

    ctx.fillStyle = isDraggingPivot ? '#3b82f6' : '#1e293b'; ctx.fillRect(pivot.x - 45, pivot.y - 15, 90, 30);
    ctx.fillStyle = '#475569'; ctx.fillRect(pivot.x - 40, pivot.y - 10, 80, 20);

    let r = 15 * Math.pow(m, 1/3); 
    ctx.beginPath(); ctx.arc(bobX, bobY, r, 0, Math.PI * 2);
    ctx.fillStyle = isDragging ? '#60a5fa' : '#cbd5e1'; ctx.fill();
}

function animate() {
    updatePhysics();
    draw();
    const event = new CustomEvent('physicsUpdate', { detail: physicsState.getEnergy() });
    window.dispatchEvent(event);
    requestAnimationFrame(animate);
}

function setupInteraction() {
    function handleStart(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        if (Math.abs(clientX - pivot.x) < 50 && Math.abs(clientY - pivot.y) < 30) { isDraggingPivot = true; trace = []; return; }
        let bobX = pivot.x + L * PIXELS_PER_METER * Math.sin(theta);
        let bobY = pivot.y + L * PIXELS_PER_METER * Math.cos(theta);
        if (Math.sqrt(Math.pow(clientX - bobX, 2) + Math.pow(clientY - bobY, 2)) < 50) { isDragging = true; omega = 0; trace = []; }
    }
    function handleMove(e) {
        if (!isDragging && !isDraggingPivot) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        if (isDraggingPivot) { pivot.x = clientX; pivot.y = clientY; trace = []; return; }
        if (isDragging) { theta = Math.atan2(clientX - pivot.x, clientY - pivot.y); omega = 0; trace = []; }
    }
    function handleEnd() { isDragging = false; isDraggingPivot = false; }

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart, {passive: false});
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);
}