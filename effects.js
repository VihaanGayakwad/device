document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const imageInput = document.getElementById('image-input');
    const loadImageBtn = document.getElementById('load-image-btn');
    const resetBtn = document.getElementById('reset-btn');
    const effectControls = document.getElementById('effect-controls');
    const moveEffectBtn = document.getElementById('move-effect-btn');
    const removeEffectBtn = document.getElementById('remove-effect-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    const swirlBtn = document.getElementById('effect-swirl');
    const stretchBtn = document.getElementById('effect-stretch');
    const mirrorBtn = document.getElementById('effect-mirror');
    const shrinkBtn = document.getElementById('effect-shrink');
    const blurBtn = document.getElementById('effect-blur');
    
    const intensitySlider = document.getElementById('intensity-slider');
    const sizeSlider = document.getElementById('size-slider');
    const intensityValue = document.getElementById('intensity-value');
    const sizeValue = document.getElementById('size-value');
    const finishBtn = document.getElementById('finish-btn');
    
    let originalImage = null;
    let effects = [];
    let selectedEffectIndex = -1;
    let isMovingEffect = false;
    let lastX = 0;
    let lastY = 0;
    
    // Effect types
    const EFFECT_TYPES = {
        SWIRL: 'swirl',
        STRETCH: 'stretch',
        MIRROR: 'mirror',
        SHRINK: 'shrink',
        BLUR: 'blur'
    };
    
    // Default settings for effects
    const DEFAULT_SETTINGS = {
        [EFFECT_TYPES.SWIRL]: { intensity: 0.2, radius: 200 },
        [EFFECT_TYPES.STRETCH]: { xFactor: 1.5, yFactor: 1.0 },
        [EFFECT_TYPES.MIRROR]: { vertical: false },
        [EFFECT_TYPES.SHRINK]: { factor: 0.7 },
        [EFFECT_TYPES.BLUR]: { amount: 5 }
    };
    
    // Set initial canvas size
    function resizeCanvas() {
        const container = document.getElementById('effects-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight - 60; // Account for controls height
        redrawCanvas();
    }
    
    window.addEventListener('resize', resizeCanvas);
    
    // Draw a placeholder for the canvas
    function drawPlaceholder() {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Load an image to apply effects', canvas.width / 2, canvas.height / 2);
    }
    
    // Load image button click handler
    loadImageBtn.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Handle image selection
    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    originalImage = img;
                    // Reset effects when loading a new image
                    effects = [];
                    selectedEffectIndex = -1;
                    effectControls.style.display = 'none';
                    redrawCanvas();
                };
                img.src = event.target.result;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Handle effect buttons
    swirlBtn.addEventListener('click', () => addEffect(EFFECT_TYPES.SWIRL));
    stretchBtn.addEventListener('click', () => addEffect(EFFECT_TYPES.STRETCH));
    mirrorBtn.addEventListener('click', () => addEffect(EFFECT_TYPES.MIRROR));
    shrinkBtn.addEventListener('click', () => addEffect(EFFECT_TYPES.SHRINK));
    blurBtn.addEventListener('click', () => addEffect(EFFECT_TYPES.BLUR));
    
    // Download button handler
    downloadBtn.addEventListener('click', () => {
        if (originalImage) {
            const link = document.createElement('a');
            link.download = `edited_image_${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    });
    
    // Add a new effect
    function addEffect(type) {
        if (!originalImage) return;
        
        const effect = {
            type,
            x: canvas.width / 2,
            y: canvas.height / 2,
            settings: { ...DEFAULT_SETTINGS[type] }
        };
        
        effects.push(effect);
        selectedEffectIndex = effects.length - 1;
        effectControls.style.display = 'flex';
        
        // Set slider values based on the selected effect
        updateSliders();
        
        redrawCanvas();
    }
    
    // Update sliders based on the selected effect
    function updateSliders() {
        if (selectedEffectIndex >= 0) {
            const effect = effects[selectedEffectIndex];
            
            // Configure sliders based on effect type
            switch (effect.type) {
                case EFFECT_TYPES.SWIRL:
                    intensitySlider.value = effect.settings.intensity * 10;
                    sizeSlider.value = effect.settings.radius;
                    intensityValue.textContent = Math.round(effect.settings.intensity * 10);
                    sizeValue.textContent = effect.settings.radius;
                    break;
                case EFFECT_TYPES.STRETCH:
                    intensitySlider.value = effect.settings.xFactor * 10;
                    sizeSlider.value = 100;
                    intensityValue.textContent = effect.settings.xFactor.toFixed(1);
                    sizeValue.textContent = '100';
                    break;
                case EFFECT_TYPES.MIRROR:
                    intensitySlider.value = effect.settings.vertical ? 10 : 0;
                    sizeSlider.value = 100;
                    intensityValue.textContent = effect.settings.vertical ? 'V' : 'H';
                    sizeValue.textContent = '100';
                    break;
                case EFFECT_TYPES.SHRINK:
                    intensitySlider.value = effect.settings.factor * 10;
                    sizeSlider.value = 100;
                    intensityValue.textContent = effect.settings.factor.toFixed(1);
                    sizeValue.textContent = '100';
                    break;
                case EFFECT_TYPES.BLUR:
                    intensitySlider.value = effect.settings.amount;
                    sizeSlider.value = 100;
                    intensityValue.textContent = effect.settings.amount;
                    sizeValue.textContent = '100';
                    break;
            }
        }
    }
    
    // Handle slider value changes
    intensitySlider.addEventListener('input', () => {
        if (selectedEffectIndex >= 0) {
            const effect = effects[selectedEffectIndex];
            const value = parseInt(intensitySlider.value);
            
            switch (effect.type) {
                case EFFECT_TYPES.SWIRL:
                    effect.settings.intensity = value / 10;
                    intensityValue.textContent = value;
                    break;
                case EFFECT_TYPES.STRETCH:
                    effect.settings.xFactor = value / 10;
                    intensityValue.textContent = (value / 10).toFixed(1);
                    break;
                case EFFECT_TYPES.MIRROR:
                    effect.settings.vertical = value >= 5;
                    intensityValue.textContent = value >= 5 ? 'V' : 'H';
                    break;
                case EFFECT_TYPES.SHRINK:
                    effect.settings.factor = value / 10;
                    intensityValue.textContent = (value / 10).toFixed(1);
                    break;
                case EFFECT_TYPES.BLUR:
                    effect.settings.amount = value;
                    intensityValue.textContent = value;
                    break;
            }
            
            redrawCanvas();
        }
    });
    
    sizeSlider.addEventListener('input', () => {
        if (selectedEffectIndex >= 0) {
            const effect = effects[selectedEffectIndex];
            const value = parseInt(sizeSlider.value);
            
            switch (effect.type) {
                case EFFECT_TYPES.SWIRL:
                case EFFECT_TYPES.STRETCH:
                case EFFECT_TYPES.MIRROR:
                case EFFECT_TYPES.SHRINK:
                case EFFECT_TYPES.BLUR:
                    effect.settings.radius = value;
                    break;
            }
            
            sizeValue.textContent = value;
            redrawCanvas();
        }
    });
    
    // Reset button handler
    resetBtn.addEventListener('click', () => {
        effects = [];
        selectedEffectIndex = -1;
        effectControls.style.display = 'none';
        redrawCanvas();
    });
    
    // Move effect button handler
    moveEffectBtn.addEventListener('click', () => {
        isMovingEffect = !isMovingEffect;
        moveEffectBtn.textContent = isMovingEffect ? 'Done' : 'Move';
    });
    
    // Remove effect button handler
    removeEffectBtn.addEventListener('click', () => {
        if (selectedEffectIndex >= 0) {
            effects.splice(selectedEffectIndex, 1);
            selectedEffectIndex = -1;
            effectControls.style.display = 'none';
            isMovingEffect = false;
            moveEffectBtn.textContent = 'Move';
            redrawCanvas();
        }
    });
    
    // Handle canvas mouse events for selecting and moving effects
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        lastX = x;
        lastY = y;
        
        if (isMovingEffect && selectedEffectIndex >= 0) {
            // Already in moving mode, nothing else to do
            return;
        }
        
        // Try to select an effect
        for (let i = effects.length - 1; i >= 0; i--) {
            const effect = effects[i];
            const distance = Math.sqrt(Math.pow(effect.x - x, 2) + Math.pow(effect.y - y, 2));
            
            if (distance < 100) { // Radius for selection
                selectedEffectIndex = i;
                effectControls.style.display = 'flex';
                updateSliders();
                redrawCanvas();
                return;
            }
        }
        
        // If no effect was clicked, deselect
        selectedEffectIndex = -1;
        effectControls.style.display = 'none';
        redrawCanvas();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isMovingEffect && selectedEffectIndex >= 0) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Move the selected effect
            effects[selectedEffectIndex].x += (x - lastX);
            effects[selectedEffectIndex].y += (y - lastY);
            
            lastX = x;
            lastY = y;
            
            redrawCanvas();
        }
    });
    
    // Finish button handler
    finishBtn.addEventListener('click', () => {
        if (originalImage) {
            // Create a copy of the current canvas as the new base image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);
            
            // Create new image from canvas
            const newImg = new Image();
            newImg.onload = () => {
                originalImage = newImg;
                effects = [];
                selectedEffectIndex = -1;
                effectControls.style.display = 'none';
                redrawCanvas();
            };
            newImg.src = tempCanvas.toDataURL('image/png');
        }
    });
    
    // Apply effects to image
    function applyEffects(image, canvas, ctx, effects, selectedEffectIndex) {
        // Create an offscreen canvas to work with
        const offCanvas = document.createElement('canvas');
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const offCtx = offCanvas.getContext('2d');
        
        // Draw original image scaled to fit canvas
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        offCtx.drawImage(image, x, y, scaledWidth, scaledHeight);
        
        // Apply each effect
        effects.forEach((effect, index) => {
            const isSelected = index === selectedEffectIndex;
            
            // Get the image data to manipulate
            const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
            const pixelData = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            // Create a buffer for the transformed pixels
            const buffer = new Uint8ClampedArray(pixelData.length);
            for (let i = 0; i < pixelData.length; i += 4) {
                buffer[i] = pixelData[i];         // R
                buffer[i + 1] = pixelData[i + 1]; // G
                buffer[i + 2] = pixelData[i + 2]; // B
                buffer[i + 3] = pixelData[i + 3]; // A
            }
            
            // Apply the specific effect
            switch (effect.type) {
                case EFFECT_TYPES.SWIRL:
                    applySwirlEffect(pixelData, buffer, width, height, effect);
                    break;
                case EFFECT_TYPES.STRETCH:
                    applyStretchEffect(pixelData, buffer, width, height, effect);
                    break;
                case EFFECT_TYPES.MIRROR:
                    applyMirrorEffect(pixelData, buffer, width, height, effect);
                    break;
                case EFFECT_TYPES.SHRINK:
                    applyShrinkEffect(pixelData, buffer, width, height, effect);
                    break;
                case EFFECT_TYPES.BLUR:
                    applyBlurEffect(pixelData, buffer, width, height, effect);
                    break;
            }
            
            // Write back the modified data
            for (let i = 0; i < pixelData.length; i += 4) {
                pixelData[i] = buffer[i];         // R
                pixelData[i + 1] = buffer[i + 1]; // G
                pixelData[i + 2] = buffer[i + 2]; // B
                pixelData[i + 3] = buffer[i + 3]; // A
            }
            
            offCtx.putImageData(imageData, 0, 0);
        });
        
        // Draw the processed image on the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offCanvas, 0, 0);
    }
    
    // Effect implementation: Swirl
    function applySwirlEffect(pixelData, buffer, width, height, effect) {
        const centerX = effect.x;
        const centerY = effect.y;
        const radius = effect.settings.radius;
        const intensity = effect.settings.intensity;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    const percent = (radius - distance) / radius;
                    const theta = percent * percent * intensity * 8.0;
                    const sin = Math.sin(theta);
                    const cos = Math.cos(theta);
                    
                    const newX = Math.round(centerX + dx * cos - dy * sin);
                    const newY = Math.round(centerY + dx * sin + dy * cos);
                    
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceIndex = (newY * width + newX) * 4;
                        
                        buffer[targetIndex] = pixelData[sourceIndex];
                        buffer[targetIndex + 1] = pixelData[sourceIndex + 1];
                        buffer[targetIndex + 2] = pixelData[sourceIndex + 2];
                        buffer[targetIndex + 3] = pixelData[sourceIndex + 3];
                    }
                }
            }
        }
    }
    
    // Effect implementation: Stretch
    function applyStretchEffect(pixelData, buffer, width, height, effect) {
        const centerX = effect.x;
        const centerY = effect.y;
        const radius = 100;
        const xFactor = effect.settings.xFactor;
        const yFactor = effect.settings.yFactor;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    const percent = (radius - distance) / radius;
                    
                    const stretchX = dx * (1 + percent * (xFactor - 1));
                    const stretchY = dy * (1 + percent * (yFactor - 1));
                    
                    const sourceX = Math.round(centerX + stretchX);
                    const sourceY = Math.round(centerY + stretchY);
                    
                    if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceIndex = (sourceY * width + sourceX) * 4;
                        
                        buffer[targetIndex] = pixelData[sourceIndex];
                        buffer[targetIndex + 1] = pixelData[sourceIndex + 1];
                        buffer[targetIndex + 2] = pixelData[sourceIndex + 2];
                        buffer[targetIndex + 3] = pixelData[sourceIndex + 3];
                    }
                }
            }
        }
    }
    
    // Effect implementation: Mirror
    function applyMirrorEffect(pixelData, buffer, width, height, effect) {
        const centerX = effect.x;
        const centerY = effect.y;
        const radius = 100;
        const vertical = effect.settings.vertical;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    let sourceX, sourceY;
                    
                    if (vertical) {
                        sourceX = x;
                        sourceY = 2 * centerY - y;
                    } else {
                        sourceX = 2 * centerX - x;
                        sourceY = y;
                    }
                    
                    if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceIndex = (sourceY * width + sourceX) * 4;
                        
                        buffer[targetIndex] = pixelData[sourceIndex];
                        buffer[targetIndex + 1] = pixelData[sourceIndex + 1];
                        buffer[targetIndex + 2] = pixelData[sourceIndex + 2];
                        buffer[targetIndex + 3] = pixelData[sourceIndex + 3];
                    }
                }
            }
        }
    }
    
    // Effect implementation: Shrink
    function applyShrinkEffect(pixelData, buffer, width, height, effect) {
        const centerX = effect.x;
        const centerY = effect.y;
        const radius = 100;
        const factor = effect.settings.factor;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    const percent = (radius - distance) / radius;
                    const scale = 1 - percent * (1 - factor);
                    
                    const sourceX = Math.round(centerX + dx / scale);
                    const sourceY = Math.round(centerY + dy / scale);
                    
                    if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceIndex = (sourceY * width + sourceX) * 4;
                        
                        buffer[targetIndex] = pixelData[sourceIndex];
                        buffer[targetIndex + 1] = pixelData[sourceIndex + 1];
                        buffer[targetIndex + 2] = pixelData[sourceIndex + 2];
                        buffer[targetIndex + 3] = pixelData[sourceIndex + 3];
                    }
                }
            }
        }
    }
    
    // Effect implementation: Blur
    function applyBlurEffect(pixelData, buffer, width, height, effect) {
        const centerX = effect.x;
        const centerY = effect.y;
        const radius = effect.settings.radius;
        const blurAmount = effect.settings.amount;
        
        if (blurAmount <= 0) return;
        
        // Create a temporary copy of the pixel data
        const tempBuffer = new Uint8ClampedArray(pixelData.length);
        for (let i = 0; i < pixelData.length; i++) {
            tempBuffer[i] = pixelData[i];
        }
        
        // Apply a simple box blur within the radius
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    const blurSize = Math.ceil(blurAmount * (radius - distance) / radius);
                    if (blurSize <= 0) continue;
                    
                    let r = 0, g = 0, b = 0, a = 0, count = 0;
                    
                    // Sample the surrounding pixels
                    for (let by = -blurSize; by <= blurSize; by++) {
                        for (let bx = -blurSize; bx <= blurSize; bx++) {
                            const sx = x + bx;
                            const sy = y + by;
                            
                            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                                const sampleIndex = (sy * width + sx) * 4;
                                r += tempBuffer[sampleIndex];
                                g += tempBuffer[sampleIndex + 1];
                                b += tempBuffer[sampleIndex + 2];
                                a += tempBuffer[sampleIndex + 3];
                                count++;
                            }
                        }
                    }
                    
                    // Write the average to the target pixel
                    if (count > 0) {
                        const targetIndex = (y * width + x) * 4;
                        buffer[targetIndex] = r / count;
                        buffer[targetIndex + 1] = g / count;
                        buffer[targetIndex + 2] = b / count;
                        buffer[targetIndex + 3] = a / count;
                    }
                }
            }
        }
    }
    
    // Redraw the canvas with effects
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (originalImage) {
            applyEffects(originalImage, canvas, ctx, effects, selectedEffectIndex);
        } else {
            drawPlaceholder();
        }
    }
    
    // Initialize the canvas
    resizeCanvas();
    drawPlaceholder();
});