// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileSelect = document.getElementById('fileSelect');
const cropContainer = document.querySelector('.crop-container');
const cropImage = document.getElementById('cropImage');
const aspectRatio = document.getElementById('aspectRatio');
const cropWidth = document.getElementById('cropWidth');
const cropHeight = document.getElementById('cropHeight');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const resetCrop = document.getElementById('resetCrop');
const confirmCrop = document.getElementById('confirmCrop');
const previewSection = document.querySelector('.preview-section');
const previewImage = document.getElementById('previewImage');
const previewDimensions = document.getElementById('previewDimensions');
const downloadButton = document.getElementById('downloadButton');

// Cropper.js 实例
let cropper = null;

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
    
    // 更新UI
    dropZone.hidden = true;
    cropContainer.hidden = false;
    previewSection.hidden = true;
    
    // 创建图片URL
    const imageUrl = URL.createObjectURL(file);
    cropImage.src = imageUrl;
    
    // 初始化裁剪器
    if (cropper) {
        cropper.destroy();
    }
    
    cropper = new Cropper(cropImage, {
        viewMode: 1,
        dragMode: 'move',
        aspectRatio: NaN,
        autoCropArea: 1,
        restore: false,
        modal: true,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
            // 获取初始裁剪框尺寸
            const data = cropper.getCropBoxData();
            cropWidth.value = Math.round(data.width);
            cropHeight.value = Math.round(data.height);
        },
        crop(event) {
            // 更新尺寸输入框
            cropWidth.value = Math.round(event.detail.width);
            cropHeight.value = Math.round(event.detail.height);
        }
    });
}

// 处理裁剪比例变更
aspectRatio.addEventListener('change', () => {
    if (!cropper) return;
    
    const value = aspectRatio.value;
    cropper.setAspectRatio(value === 'free' ? NaN : parseFloat(value));
});

// 处理尺寸输入
let resizeTimeout;
cropWidth.addEventListener('input', handleSizeInput);
cropHeight.addEventListener('input', handleSizeInput);

function handleSizeInput() {
    if (!cropper) return;
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const width = parseInt(cropWidth.value);
        const height = parseInt(cropHeight.value);
        
        if (width > 0 && height > 0) {
            cropper.setCropBoxData({
                width: width,
                height: height
            });
        }
    }, 300);
}

// 处理旋转
rotateLeft.addEventListener('click', () => {
    if (!cropper) return;
    cropper.rotate(-90);
});

rotateRight.addEventListener('click', () => {
    if (!cropper) return;
    cropper.rotate(90);
});

// 处理缩放
zoomIn.addEventListener('click', () => {
    if (!cropper) return;
    cropper.zoom(0.1);
});

zoomOut.addEventListener('click', () => {
    if (!cropper) return;
    cropper.zoom(-0.1);
});

// 处理重置
resetCrop.addEventListener('click', () => {
    if (!cropper) return;
    cropper.reset();
});

// 处理确认裁剪
confirmCrop.addEventListener('click', () => {
    if (!cropper) return;
    
    // 获取裁剪后的Canvas
    const canvas = cropper.getCroppedCanvas({
        imageSmoothingQuality: 'high'
    });
    
    // 显示预览
    previewImage.src = canvas.toDataURL();
    previewDimensions.textContent = `${canvas.width} x ${canvas.height}`;
    previewSection.hidden = false;
    
    // 启用下载按钮
    downloadButton.disabled = false;
});

// 处理下载
downloadButton.addEventListener('click', () => {
    if (!cropper) return;
    
    const canvas = cropper.getCroppedCanvas({
        imageSmoothingQuality: 'high'
    });
    
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = 'cropped-image.jpg';
        link.href = URL.createObjectURL(blob);
        link.click();
    }, 'image/jpeg', 0.9);
}); 