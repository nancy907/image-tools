// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 为所有工具卡片添加点击效果
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // 添加点击波纹效果
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            card.appendChild(ripple);
            
            // 移除波纹效果
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// 检测设备类型
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 根据设备类型添加相应的类
if (isMobile()) {
    document.body.classList.add('mobile');
}

// 添加页面切换动画
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // 从缓存恢复页面时的处理
        document.body.style.opacity = '1';
    }
});

window.addEventListener('beforeunload', () => {
    // 页面离开时的过渡动画
    document.body.style.opacity = '0';
}); 