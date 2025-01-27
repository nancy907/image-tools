// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileSelect = document.getElementById('fileSelect');
const watermarkEditor = document.querySelector('.watermark-editor');
const sourcePreview = document.getElementById('sourcePreview');
const watermarkLayer = document.getElementById('watermarkLayer');

// 水印类型切换
const textType = document.getElementById('textType');
const imageType = document.getElementById('imageType');
const textSettings = document.getElementById('textSettings');
const imageSettings = document.getElementById('imageSettings');

// 文字水印设置
const watermarkText = document.getElementById('watermarkText');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');

// 图片水印设置
const watermarkImageSelect = document.getElementById('watermarkImageSelect');
const watermarkImageInput = document.getElementById('watermarkImageInput');
const imageSize = document.getElementById('imageSize');

// 通用设置
const opacity = document.getElementById('opacity');
const positionButtons = document.querySelectorAll('.position-grid button');
const rotation = document.getElementById('rotation');

// 操作按钮
const resetButton = document.getElementById('resetButton');
const downloadButton = document.getElementById('downloadButton');

// 水印列表相关
const watermarkList = document.getElementById('watermarkList');
const addWatermarkButton = document.getElementById('addWatermark');
const watermarkSettings = document.getElementById('watermarkSettings');

// 平铺设置
const enableTiling = document.getElementById('enableTiling');
const tileOptions = document.querySelector('.tile-options');
const tileSpacingX = document.getElementById('tileSpacingX');
const tileSpacingY = document.getElementById('tileSpacingY');
const tileOffset = document.getElementById('tileOffset');

// 水印数据
let watermarks = [{
    id: 1,
    type: 'text',
    text: '',
    fontSize: 24,
    color: '#000000',
    imageUrl: '',
    imageSize: 50,
    opacity: 50,
    position: 'bottom-right',
    rotation: 0,
    tiling: {
        enabled: false,
        spacingX: 150,
        spacingY: 150,
        offset: 0
    }
}];
let currentWatermarkId = 1;

// 当前状态
let currentImage = null;
let watermarkImage = null;
let currentPosition = 'bottom-right';
let isTextWatermark = true;

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

// 处理水印图片选择
watermarkImageSelect.addEventListener('click', () => {
    watermarkImageInput.click();
});

watermarkImageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            watermarkImage = new Image();
            watermarkImage.onload = updateWatermark;
            watermarkImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 处理文件选择
function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = new Image();
        currentImage.onload = () => {
            sourcePreview.src = currentImage.src;
            watermarkEditor.hidden = false;
            updateWatermark();
        };
        currentImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 水印类型切换
textType.addEventListener('click', () => {
    isTextWatermark = true;
    textType.classList.add('active');
    imageType.classList.remove('active');
    textSettings.hidden = false;
    imageSettings.hidden = true;
    
    const watermark = watermarks.find(w => w.id === currentWatermarkId);
    if (watermark) {
        watermark.type = 'text';
    }
    
    updateWatermark();
});

imageType.addEventListener('click', () => {
    isTextWatermark = false;
    imageType.classList.add('active');
    textType.classList.remove('active');
    textSettings.hidden = true;
    imageSettings.hidden = false;
    
    const watermark = watermarks.find(w => w.id === currentWatermarkId);
    if (watermark) {
        watermark.type = 'image';
    }
    
    updateWatermark();
});

// 监听设置变化
[watermarkText, fontSize, textColor, imageSize, opacity, rotation].forEach(input => {
    input.addEventListener('input', () => {
        saveCurrentWatermark();
        updateWatermark();
    });
});

// 监听平铺设置变化
enableTiling.addEventListener('change', () => {
    tileOptions.hidden = !enableTiling.checked;
    saveCurrentWatermark();
    updateWatermark();
});

[tileSpacingX, tileSpacingY, tileOffset].forEach(input => {
    input.addEventListener('input', () => {
        saveCurrentWatermark();
        updateWatermark();
    });
});

// 位置选择
positionButtons.forEach(button => {
    button.addEventListener('click', () => {
        positionButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentPosition = button.dataset.position;
        
        const watermark = watermarks.find(w => w.id === currentWatermarkId);
        if (watermark) {
            watermark.position = currentPosition;
        }
        
        updateWatermark();
    });
});

// 更新水印显示
function updateWatermark() {
    if (!currentImage) return;
    
    // 清除现有水印
    watermarkLayer.innerHTML = '';
    
    // 渲染所有水印
    watermarks.forEach(watermark => {
        if (watermark.tiling.enabled) {
            // 计算平铺参数
            const containerWidth = watermarkLayer.offsetWidth;
            const containerHeight = watermarkLayer.offsetHeight;
            const spacingX = parseInt(watermark.tiling.spacingX);
            const spacingY = parseInt(watermark.tiling.spacingY);
            const offset = parseInt(watermark.tiling.offset);
            
            // 计算需要的行数和列数
            const cols = Math.ceil(containerWidth / spacingX) + 1;
            const rows = Math.ceil(containerHeight / spacingY) + 1;
            
            // 创建平铺水印
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const element = createWatermarkElement(watermark);
                    if (element) {
                        // 计算位置，包含错位效果
                        const x = col * spacingX + (row % 2) * (offset / 100 * spacingX);
                        const y = row * spacingY;
                        
                        element.style.position = 'absolute';
                        element.style.left = `${x}px`;
                        element.style.top = `${y}px`;
                        element.style.transform = `rotate(${watermark.rotation}deg)`;
                        
                        watermarkLayer.appendChild(element);
                    }
                }
            }
        } else {
            // 创建单个水印
            const element = createWatermarkElement(watermark);
            if (element) {
                element.style.position = 'absolute';
                watermarkLayer.appendChild(element);
                positionElement(element, watermark.position);
            }
        }
    });
}

// 创建水印元素
function createWatermarkElement(watermark) {
    if (watermark.type === 'text' && watermark.text) {
        // 创建文字水印
        const text = document.createElement('div');
        text.textContent = watermark.text;
        text.style.fontSize = `${watermark.fontSize}px`;
        text.style.color = watermark.color;
        text.style.opacity = watermark.opacity / 100;
        text.style.whiteSpace = 'nowrap';
        return text;
    } else if (watermark.type === 'image' && watermark.imageUrl) {
        // 创建图片水印
        const img = document.createElement('img');
        img.src = watermark.imageUrl;
        img.style.width = `${watermark.imageSize}%`;
        img.style.opacity = watermark.opacity / 100;
        return img;
    }
    return null;
}

// 定位水印元素
function positionElement(element, position) {
    const [vertical, horizontal] = position.split('-');
    
    // 垂直位置
    switch (vertical) {
        case 'top':
            element.style.top = '24px';
            break;
        case 'middle':
            element.style.top = '50%';
            element.style.transform += ' translateY(-50%)';
            break;
        case 'bottom':
            element.style.bottom = '24px';
            break;
    }
    
    // 水平位置
    switch (horizontal) {
        case 'left':
            element.style.left = '24px';
            break;
        case 'center':
            element.style.left = '50%';
            element.style.transform += ' translateX(-50%)';
            break;
        case 'right':
            element.style.right = '24px';
            break;
    }
}

// 重置按钮
resetButton.addEventListener('click', () => {
    watermarks = [{
        id: 1,
        type: 'text',
        text: '',
        fontSize: 24,
        color: '#000000',
        imageUrl: '',
        imageSize: 50,
        opacity: 50,
        position: 'bottom-right',
        rotation: 0,
        tiling: {
            enabled: false,
            spacingX: 150,
            spacingY: 150,
            offset: 0
        }
    }];
    
    watermarkList.innerHTML = '';
    addWatermarkToList(watermarks[0]);
    selectWatermark(1);
});

// 下载按钮
downloadButton.addEventListener('click', () => {
    if (!currentImage) return;
    
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    
    // 绘制原始图片
    const ctx = canvas.getContext('2d');
    ctx.drawImage(currentImage, 0, 0);
    
    // 绘制所有水印
    watermarks.forEach(watermark => {
        if (watermark.tiling.enabled) {
            // 计算平铺参数
            const spacingX = parseInt(watermark.tiling.spacingX) * (canvas.width / watermarkLayer.offsetWidth);
            const spacingY = parseInt(watermark.tiling.spacingY) * (canvas.height / watermarkLayer.offsetHeight);
            const offset = parseInt(watermark.tiling.offset);
            
            // 计算需要的行数和列数
            const cols = Math.ceil(canvas.width / spacingX) + 1;
            const rows = Math.ceil(canvas.height / spacingY) + 1;
            
            // 绘制平铺水印
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * spacingX + (row % 2) * (offset / 100 * spacingX);
                    const y = row * spacingY;
                    
                    if (watermark.type === 'text' && watermark.text) {
                        // 绘制文字水印
                        ctx.save();
                        ctx.font = `${watermark.fontSize}px SF Pro Display, sans-serif`;
                        ctx.fillStyle = watermark.color;
                        ctx.globalAlpha = watermark.opacity / 100;
                        ctx.translate(x, y);
                        ctx.rotate(watermark.rotation * Math.PI / 180);
                        ctx.fillText(watermark.text, 0, watermark.fontSize);
                        ctx.restore();
                    } else if (watermark.type === 'image' && watermark.imageUrl) {
                        // 绘制图片水印
                        const img = new Image();
                        img.src = watermark.imageUrl;
                        const width = img.width * (watermark.imageSize / 100);
                        const height = img.height * (watermark.imageSize / 100);
                        
                        ctx.save();
                        ctx.translate(x + width / 2, y + height / 2);
                        ctx.rotate(watermark.rotation * Math.PI / 180);
                        ctx.globalAlpha = watermark.opacity / 100;
                        ctx.drawImage(img, -width / 2, -height / 2, width, height);
                        ctx.restore();
                    }
                }
            }
        } else {
            // 绘制单个水印
            if (watermark.type === 'text' && watermark.text) {
                // 设置文字样式
                ctx.font = `${watermark.fontSize}px SF Pro Display, sans-serif`;
                ctx.fillStyle = watermark.color;
                ctx.globalAlpha = watermark.opacity / 100;
                
                // 计算文字位置
                const textWidth = ctx.measureText(watermark.text).width;
                const textHeight = parseInt(watermark.fontSize);
                const padding = 24 * (canvas.width / sourcePreview.offsetWidth);
                
                // 获取位置坐标
                const position = getWatermarkPosition(textWidth, textHeight, canvas.width, canvas.height, padding, watermark.position);
                
                // 绘制旋转的文字
                ctx.save();
                ctx.translate(position.x + textWidth / 2, position.y);
                ctx.rotate(watermark.rotation * Math.PI / 180);
                ctx.fillText(watermark.text, -textWidth / 2, textHeight / 2);
                ctx.restore();
            } else if (watermark.type === 'image' && watermark.imageUrl) {
                const img = new Image();
                img.src = watermark.imageUrl;
                
                // 计算水印图片大小
                const scale = watermark.imageSize / 100;
                const width = img.width * scale;
                const height = img.height * scale;
                
                // 获取位置坐标
                const padding = 24 * (canvas.width / sourcePreview.offsetWidth);
                const position = getWatermarkPosition(width, height, canvas.width, canvas.height, padding, watermark.position);
                
                // 绘制旋转的图片
                ctx.save();
                ctx.translate(position.x + width / 2, position.y + height / 2);
                ctx.rotate(watermark.rotation * Math.PI / 180);
                ctx.globalAlpha = watermark.opacity / 100;
                ctx.drawImage(img, -width / 2, -height / 2, width, height);
                ctx.restore();
            }
        }
    });
    
    // 下载图片
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 获取水印位置
function getWatermarkPosition(width, height, canvasWidth, canvasHeight, padding, position) {
    const [vertical, horizontal] = position.split('-');
    const pos = { x: 0, y: 0 };
    
    // 计算垂直位置
    switch (vertical) {
        case 'top':
            pos.y = padding;
            break;
        case 'middle':
            pos.y = (canvasHeight - height) / 2;
            break;
        case 'bottom':
            pos.y = canvasHeight - height - padding;
            break;
    }
    
    // 计算水平位置
    switch (horizontal) {
        case 'left':
            pos.x = padding;
            break;
        case 'center':
            pos.x = (canvasWidth - width) / 2;
            break;
        case 'right':
            pos.x = canvasWidth - width - padding;
            break;
    }
    
    return pos;
}

// 添加水印
addWatermarkButton.addEventListener('click', () => {
    const newId = watermarks.length > 0 ? Math.max(...watermarks.map(w => w.id)) + 1 : 1;
    const newWatermark = {
        id: newId,
        type: 'text',
        text: '',
        fontSize: 24,
        color: '#000000',
        imageUrl: '',
        imageSize: 50,
        opacity: 50,
        position: 'bottom-right',
        rotation: 0,
        tiling: {
            enabled: false,
            spacingX: 150,
            spacingY: 150,
            offset: 0
        }
    };
    
    watermarks.push(newWatermark);
    addWatermarkToList(newWatermark);
    selectWatermark(newId);
});

// 添加水印到列表
function addWatermarkToList(watermark) {
    const item = document.createElement('div');
    item.className = 'watermark-item';
    item.dataset.id = watermark.id;
    
    item.innerHTML = `
        <div class="item-header">
            <span class="item-title">水印 ${watermark.id}</span>
            <div class="item-actions">
                <button class="icon-button" data-action="edit">✎</button>
                <button class="icon-button" data-action="delete">×</button>
            </div>
        </div>
    `;
    
    watermarkList.appendChild(item);
    
    // 添加事件监听
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-button')) {
            selectWatermark(watermark.id);
        }
    });
    
    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
        deleteWatermark(watermark.id);
    });
    
    item.querySelector('[data-action="edit"]').addEventListener('click', () => {
        selectWatermark(watermark.id);
    });
}

// 选择水印
function selectWatermark(id) {
    currentWatermarkId = id;
    const watermark = watermarks.find(w => w.id === id);
    
    // 更新列表项状态
    document.querySelectorAll('.watermark-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.id) === id);
    });
    
    // 更新设置面板
    if (watermark) {
        // 设置水印类型
        isTextWatermark = watermark.type === 'text';
        textType.classList.toggle('active', isTextWatermark);
        imageType.classList.toggle('active', !isTextWatermark);
        textSettings.hidden = !isTextWatermark;
        imageSettings.hidden = isTextWatermark;
        
        // 更新设置值
        watermarkText.value = watermark.text;
        fontSize.value = watermark.fontSize;
        textColor.value = watermark.color;
        imageSize.value = watermark.imageSize;
        opacity.value = watermark.opacity;
        rotation.value = watermark.rotation;
        
        // 更新平铺设置
        enableTiling.checked = watermark.tiling.enabled;
        tileOptions.hidden = !watermark.tiling.enabled;
        tileSpacingX.value = watermark.tiling.spacingX;
        tileSpacingY.value = watermark.tiling.spacingY;
        tileOffset.value = watermark.tiling.offset;
        
        // 更新位置按钮
        positionButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.position === watermark.position);
        });
        
        // 更新显示的值
        updateDisplayValues();
    }
    
    // 更新水印显示
    updateWatermark();
}

// 删除水印
function deleteWatermark(id) {
    const index = watermarks.findIndex(w => w.id === id);
    if (index !== -1) {
        watermarks.splice(index, 1);
        const item = watermarkList.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
        
        // 如果删除的是当前选中的水印，选择另一个水印
        if (currentWatermarkId === id) {
            const nextWatermark = watermarks[0];
            if (nextWatermark) {
                selectWatermark(nextWatermark.id);
            }
        }
        
        updateWatermark();
    }
}

// 更新显示的值
function updateDisplayValues() {
    document.querySelectorAll('.value-display').forEach(display => {
        const input = display.previousElementSibling;
        if (input.id === 'fontSize') {
            display.textContent = `${input.value}px`;
        } else if (input.id === 'imageSize' || input.id === 'opacity') {
            display.textContent = `${input.value}%`;
        } else if (input.id === 'rotation') {
            display.textContent = `${input.value}°`;
        }
    });
}

// 保存当前水印设置
function saveCurrentWatermark() {
    const watermark = watermarks.find(w => w.id === currentWatermarkId);
    if (watermark) {
        watermark.type = isTextWatermark ? 'text' : 'image';
        watermark.text = watermarkText.value;
        watermark.fontSize = parseInt(fontSize.value);
        watermark.color = textColor.value;
        watermark.imageSize = parseInt(imageSize.value);
        watermark.opacity = parseInt(opacity.value);
        watermark.position = currentPosition;
        watermark.rotation = parseInt(rotation.value);
        
        // 保存平铺设置
        watermark.tiling = {
            enabled: enableTiling.checked,
            spacingX: parseInt(tileSpacingX.value),
            spacingY: parseInt(tileSpacingY.value),
            offset: parseInt(tileOffset.value)
        };
        
        if (!isTextWatermark && watermarkImage) {
            watermark.imageUrl = watermarkImage.src;
        }
    }
}

// 更新滑块值显示
document.querySelectorAll('.slider').forEach(slider => {
    const display = slider.nextElementSibling;
    slider.addEventListener('input', () => {
        if (slider.id === 'fontSize') {
            display.textContent = `${slider.value}px`;
        } else if (slider.id === 'imageSize' || slider.id === 'opacity') {
            display.textContent = `${slider.value}%`;
        } else if (slider.id === 'rotation') {
            display.textContent = `${slider.value}°`;
        }
    });
}); 