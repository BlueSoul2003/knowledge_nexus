// js/core_rpg.js

// 從 LocalStorage 讀取資料
let playerStats = JSON.parse(localStorage.getItem('fp_physics_stats') || '{"level": 1, "exp": 0}');

// 計算升級所需經驗值
function getExpRequired(level) {
    return level * 100;
}

// UI 元素參考 (將在初始化時綁定)
let uiElements = {};

// 模組初始化函數
export function initRPG(elements) {
    uiElements = elements;
    updatePlayerUI();
}

// 更新畫面上的等級與經驗條
function updatePlayerUI() {
    if (!uiElements.levelText) return; // 確保 UI 元素已綁定
    
    uiElements.levelText.innerText = playerStats.level;
    let reqExp = getExpRequired(playerStats.level);
    let expPercent = (playerStats.exp / reqExp) * 100;
    uiElements.expFill.style.width = `${expPercent}%`;
    uiElements.expText.innerText = Math.floor(expPercent);
}

// 獲取經驗值並處理升級邏輯
export function gainExp(amount, eventX, eventY) {
    // 1. 浮動文字動畫特效
    if (eventX && eventY) {
        const popup = document.createElement('div');
        popup.className = 'exp-popup text-xl';
        popup.innerText = `+${amount} XP`;
        popup.style.left = `${eventX}px`;
        popup.style.top = `${eventY}px`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1200);
    }

    // 2. 增加經驗值
    playerStats.exp += amount;
    let reqExp = getExpRequired(playerStats.level);
    
    // 3. 判斷是否升級
    if (playerStats.exp >= reqExp) {
        playerStats.exp -= reqExp;
        playerStats.level += 1;
        
        // 升級特效
        const toast = document.createElement('div');
        toast.className = 'level-up-toast text-lg flex items-center gap-2';
        toast.innerHTML = `🌟 升級了！達到 Level ${playerStats.level}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    // 4. 存檔並更新 UI
    localStorage.setItem('fp_physics_stats', JSON.stringify(playerStats));
    updatePlayerUI();
}
