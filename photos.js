document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('photo-input');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const selectedPhoto = document.getElementById('selected-photo');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    const zoomLevelDisplay = document.getElementById('zoom-level');
    const photoContainer = document.getElementById('photo-container');
    
    // Zoom functionality
    let currentZoom = 1;
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 3;
    
    function updateZoom() {
        photoContainer.style.transform = `scale(${currentZoom})`;
        zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    }
    
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            updateZoom();
        }
    });
    
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            updateZoom();
        }
    });
    
    resetZoomBtn.addEventListener('click', () => {
        currentZoom = 1;
        updateZoom();
    });
    
    // Load from local storage if available
    const savedPhoto = localStorage.getItem('selectedPhoto');
    if (savedPhoto) {
        selectedPhoto.src = savedPhoto;
    }
    
    changePhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                selectedPhoto.src = e.target.result;
                // Save to local storage
                localStorage.setItem('selectedPhoto', e.target.result);
                // Reset zoom when changing photos
                currentZoom = 1;
                updateZoom();
            };
            
            reader.readAsDataURL(file);
        }
    });
});