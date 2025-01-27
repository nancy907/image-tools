// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileSelect = document.getElementById('fileSelect');
const convertButton = document.getElementById('convertButton');
const progressBar = document.querySelector('.progress-fill');
const progressSection = document.querySelector('.convert-progress');
const progressText = document.querySelector('.progress-text');

// 文件对象
let selectedFile = null;

// 处理拖拽事件
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// 处理文件选择
fileSelect.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// 处理文件选择
function handleFileSelect(file) {
    selectedFile = file;
    
    // 更新UI状态
    convertButton.disabled = false;
    dropZone.querySelector('h3').textContent = file.name;
    dropZone.querySelector('p').textContent = formatFileSize(file.size);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理文件转换
convertButton.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    const targetFormat = document.getElementById('targetFormat').value;
    
    // 显示进度条
    progressSection.hidden = false;
    convertButton.disabled = true;
    
    try {
        // 模拟转换过程
        await simulateConversion();
        
        // 转换完成
        progressText.textContent = '转换完成！';
        
        // 模拟下载
        setTimeout(() => {
            const link = document.createElement('a');
            const fileName = selectedFile.name.split('.')[0] + '.' + targetFormat;
            link.href = URL.createObjectURL(selectedFile);
            link.download = fileName;
            link.click();
            
            // 重置状态
            resetUI();
        }, 1000);
        
    } catch (error) {
        progressText.textContent = '转换失败，请重试';
        console.error('转换失败:', error);
    }
});

// 模拟转换过程
async function simulateConversion() {
    const steps = 10;
    const stepTime = 300;
    
    for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepTime));
        const progress = (i / steps) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = `正在转换...${Math.round(progress)}%`;
    }
}

// 重置UI状态
function resetUI() {
    selectedFile = null;
    convertButton.disabled = true;
    progressSection.hidden = true;
    progressBar.style.width = '0';
    dropZone.querySelector('h3').textContent = '拖拽文件到这里';
    dropZone.querySelector('p').textContent = '或';
    fileInput.value = '';
} 