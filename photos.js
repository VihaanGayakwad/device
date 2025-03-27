document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('photo-input');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const deletePhotoBtn = document.getElementById('delete-photo-btn');
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
    
    changePhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });
    
    deletePhotoBtn.addEventListener('click', () => {
        selectedPhoto.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='20' text-anchor='middle' fill='%23999'>No photo selected</text></svg>";
        // Reset zoom when deleting photos
        currentZoom = 1;
        updateZoom();
    });
    
    photoInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                selectedPhoto.src = e.target.result;
                // Reset zoom when changing photos
                currentZoom = 1;
                updateZoom();
            };
            
            reader.readAsDataURL(file);
        }
    });
});