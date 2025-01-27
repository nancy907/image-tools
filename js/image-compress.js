// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileSelect = document.getElementById('fileSelect');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.querySelector('.quality-value');
const maxWidth = document.getElementById('maxWidth');
const maxHeight = document.getElementById('maxHeight');
const previewSection = document.querySelector('.preview-section');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressedSize = document.getElementById('compressedSize');
const compressedDimensions = document.getElementById('compressedDimensions');

// 当前选中的图片
let selectedFile = null;
let compressedBlob = null;

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
    if (files.length > 0 && files[0].type.startsWith('image/')) {
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
async function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    selectedFile = file;
    compressButton.disabled = false;
    
    // 更新UI
    dropZone.querySelector('h3').textContent = file.name;
    dropZone.querySelector('p').textContent = formatFileSize(file.size);
    
    // 显示原图预览
    const originalUrl = URL.createObjectURL(file);
    originalPreview.src = originalUrl;
    originalSize.textContent = formatFileSize(file.size);
    
    // 获取图片尺寸
    const img = new Image();
    img.onload = () => {
        originalDimensions.textContent = `${img.width} x ${img.height}`;
        // 根据图片尺寸设置默认的最大宽高
        maxWidth.value = img.width;
        maxHeight.value = img.height;
    };
    img.src = originalUrl;
    
    // 显示预览区域
    previewSection.hidden = false;
}

// 处理压缩质量滑块
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
});

// 处理压缩
compressButton.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    try {
        const result = await compressImage(selectedFile, {
            maxWidth: parseInt(maxWidth.value),
            maxHeight: parseInt(maxHeight.value),
            quality: parseInt(qualitySlider.value) / 100
        });
        
        // 更新压缩后预览
        compressedBlob = result.blob;
        compressedPreview.src = result.url;
        compressedSize.textContent = formatFileSize(result.blob.size);
        compressedDimensions.textContent = `${result.width} x ${result.height}`;
        
        // 计算压缩率
        const compressionRatio = ((1 - result.blob.size / selectedFile.size) * 100).toFixed(1);
        dropZone.querySelector('p').textContent = `压缩率: ${compressionRatio}%`;
        
        // 启用下载按钮
        downloadButton.disabled = false;
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试');
    }
});

// 处理下载
downloadButton.addEventListener('click', () => {
    if (!compressedBlob) return;
    
    const link = document.createElement('a');
    const fileName = selectedFile.name.split('.');
    fileName.pop();
    fileName.push('compressed.jpg');
    
    link.href = URL.createObjectURL(compressedBlob);
    link.download = fileName.join('.');
    link.click();
});

// 图片压缩函数
async function compressImage(file, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // 计算新的尺寸
            let { width, height } = calculateAspectRatioFit(
                img.width,
                img.height,
                options.maxWidth,
                options.maxHeight
            );
            
            // 创建Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为Blob
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(img.src);
                    resolve({
                        blob,
                        url: URL.createObjectURL(blob),
                        width,
                        height
                    });
                },
                'image/jpeg',
                options.quality
            );
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// 计算保持宽高比的新尺寸
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
        width: Math.round(srcWidth * ratio),
        height: Math.round(srcHeight * ratio)
    };
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 