document.addEventListener('DOMContentLoaded', () => {
    const cameraFeed = document.getElementById('camera-feed');
    const capturedImage = document.getElementById('captured-image');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const cameraControls = document.getElementById('camera-controls');
    const photoControls = document.getElementById('photo-controls');
    
    let stream = null;
    let photoData = null;
    
    // Initialize camera
    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                },
                audio: false
            });
            cameraFeed.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please make sure you have granted camera permissions.');
        }
    }
    
    // Take a photo
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const width = cameraFeed.videoWidth;
        const height = cameraFeed.videoHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraFeed, 0, 0, width, height);
        
        photoData = canvas.toDataURL('image/jpeg');
        capturedImage.src = photoData;
        
        // Switch to photo view
        cameraFeed.style.display = 'none';
        capturedImage.style.display = 'block';
        cameraControls.style.display = 'none';
        photoControls.style.display = 'flex';
        
        // Stop camera stream to save battery
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
    
    // Retake photo
    retakeBtn.addEventListener('click', () => {
        // Switch back to camera view
        cameraFeed.style.display = 'block';
        capturedImage.style.display = 'none';
        cameraControls.style.display = 'flex';
        photoControls.style.display = 'none';
        
        // Restart camera
        initCamera();
    });
    
    // Delete photo
    deleteBtn.addEventListener('click', () => {
        // Switch back to camera view
        cameraFeed.style.display = 'block';
        capturedImage.style.display = 'none';
        cameraControls.style.display = 'flex';
        photoControls.style.display = 'none';
        
        // Restart camera
        initCamera();
    });
    
    // Initialize the camera when the page loads
    initCamera();
});