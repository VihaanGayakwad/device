// Split out of effects.js - helper functions for effects

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
            case 'swirl':
                applySwirlEffect(pixelData, buffer, width, height, effect);
                break;
            case 'stretch':
                applyStretchEffect(pixelData, buffer, width, height, effect);
                break;
            case 'mirror':
                applyMirrorEffect(pixelData, buffer, width, height, effect);
                break;
            case 'shrink':
                applyShrinkEffect(pixelData, buffer, width, height, effect);
                break;
            case 'blur':
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