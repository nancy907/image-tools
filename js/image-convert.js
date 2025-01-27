// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileSelect = document.getElementById('fileSelect');
const convertOptions = document.querySelector('.convert-options');
const sourcePreview = document.getElementById('sourcePreview');
const sourceFormat = document.getElementById('sourceFormat');
const sourceSize = document.getElementById('sourceSize');
const targetFormat = document.getElementById('targetFormat');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.querySelector('.quality-value');
const convertButton = document.getElementById('convertButton');
const resultSection = document.querySelector('.result-section');
const resultPreview = document.getElementById('resultPreview');
const resultFormat = document.getElementById('resultFormat');
const resultSize = document.getElementById('resultSize');
const downloadButton = document.getElementById('downloadButton');

// 当前选中的图片
let selectedFile = null;
let convertedBlob = null;

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
function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    selectedFile = file;
    
    // 更新源文件信息
    sourceFormat.textContent = `格式: ${getFormatName(file.type)}`;
    sourceSize.textContent = `大小: ${formatFileSize(file.size)}`;
    
    // 显示预览
    const imageUrl = URL.createObjectURL(file);
    sourcePreview.src = imageUrl;
    
    // 显示转换选项
    convertOptions.hidden = false;
    resultSection.hidden = true;
}

// 处理质量滑块
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
});

// 处理格式转换
convertButton.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    try {
        const result = await convertImage(selectedFile, {
            format: targetFormat.value,
            quality: parseInt(qualitySlider.value) / 100
        });
        
        // 更新转换结果
        convertedBlob = result.blob;
        resultPreview.src = result.url;
        resultFormat.textContent = `格式: ${getFormatName(result.blob.type)}`;
        resultSize.textContent = `大小: ${formatFileSize(result.blob.size)}`;
        
        // 显示结果区域
        resultSection.hidden = false;
        
    } catch (error) {
        console.error('转换失败:', error);
        alert('图片转换失败，请重试');
    }
});

// 处理下载
downloadButton.addEventListener('click', () => {
    if (!convertedBlob) return;
    
    const link = document.createElement('a');
    const extension = targetFormat.value.split('/')[1];
    const fileName = `converted.${extension}`;
    
    link.href = URL.createObjectURL(convertedBlob);
    link.download = fileName;
    link.click();
});

// 图片转换函数
async function convertImage(file, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // 创建Canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // 转换为Blob
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(img.src);
                    resolve({
                        blob,
                        url: URL.createObjectURL(blob)
                    });
                },
                options.format,
                options.quality
            );
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// 获取格式名称
function getFormatName(mimeType) {
    const formats = {
        'image/jpeg': 'JPG',
        'image/png': 'PNG',
        'image/webp': 'WebP',
        'image/gif': 'GIF'
    };
    return formats[mimeType] || mimeType.split('/')[1].toUpperCase();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 