document.addEventListener('DOMContentLoaded', () => {
    const videoFeed = document.getElementById('video-feed');
    const recordedVideo = document.getElementById('recorded-video');
    const recordBtn = document.getElementById('record-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const flipCameraBtn = document.getElementById('flip-camera-btn');
    const videoControls = document.getElementById('video-controls');
    const playbackControls = document.getElementById('playback-controls');
    const timerDisplay = document.getElementById('timer-display');
    const downloadBtn = document.getElementById('download-btn');
    
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let facingMode = 'environment'; // Default to back camera
    let isRecording = false;
    let isPaused = false;
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    
    // Initialize camera
    async function initCamera() {
        try {
            // Stop any existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode
                },
                audio: true // We want audio for videos
            });
            videoFeed.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera or microphone. Please make sure you have granted necessary permissions.');
        }
    }
    
    // Flip camera
    flipCameraBtn.addEventListener('click', () => {
        if (isRecording) return; // Don't allow camera flip while recording
        
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        initCamera();
    });
    
    // Update timer display
    function updateTimer() {
        const now = Date.now();
        const totalTime = elapsedTime + (now - startTime);
        const seconds = Math.floor((totalTime / 1000) % 60).toString().padStart(2, '0');
        const minutes = Math.floor((totalTime / 1000 / 60) % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }
    
    // Start/stop recording
    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            // Start recording
            recordedChunks = [];
            
            // Get fresh microphone access only when starting to record
            navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            }).then(audioStream => {
                // Combine video and audio tracks
                const videoTracks = stream.getVideoTracks();
                const audioTracks = audioStream.getAudioTracks();
                
                const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
                mediaRecorder = new MediaRecorder(combinedStream);
                
                // Set up media recorder events
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { 
                        type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'  // Apple-compatible format
                    });
                    const videoURL = URL.createObjectURL(blob);
                    recordedVideo.src = videoURL;
                    
                    // Stop audio tracks when recording stops
                    audioTracks.forEach(track => track.stop());
                };
                
                // Start the recording
                mediaRecorder.start(100); // Collect data every 100ms
                isRecording = true;
                isPaused = false;
                recordBtn.textContent = 'Stop Recording';
                recordBtn.classList.add('recording');
                pauseBtn.style.display = 'inline-block';
                pauseBtn.textContent = 'Pause';
                
                // Start timer
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
                timerDisplay.style.display = 'block';
            }).catch(err => {
                console.error('Error accessing microphone:', err);
                alert('Unable to access microphone. Please make sure you have granted necessary permissions.');
            });
            
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
            clearInterval(timerInterval);
            elapsedTime = 0;
            
            // Switch to playback view
            videoFeed.style.display = 'none';
            recordedVideo.style.display = 'block';
            videoControls.style.display = 'none';
            playbackControls.style.display = 'flex';
            recordBtn.classList.remove('recording');
            pauseBtn.style.display = 'none';
            
            // Stop camera stream to save battery, but keep only video tracks
            if (stream) {
                stream.getVideoTracks().forEach(track => {
                    if (track.kind === 'video') {
                        // Don't stop video tracks yet to allow for camera flip
                    } else {
                        // Stop any audio tracks immediately
                        track.stop();
                    }
                });
            }
        }
    });
    
    // Pause/resume recording
    pauseBtn.addEventListener('click', () => {
        if (!isRecording) return;
        
        if (!isPaused) {
            // Pause recording
            mediaRecorder.pause();
            isPaused = true;
            pauseBtn.textContent = 'Resume';
            recordBtn.textContent = 'Recording Paused';
            
            // Pause timer
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
        } else {
            // Resume recording
            mediaRecorder.resume();
            isPaused = false;
            pauseBtn.textContent = 'Pause';
            recordBtn.textContent = 'Stop Recording';
            
            // Resume timer
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
        }
    });
    
    // Retake video
    retakeBtn.addEventListener('click', () => {
        // Switch back to camera view
        videoFeed.style.display = 'block';
        recordedVideo.style.display = 'none';
        videoControls.style.display = 'flex';
        playbackControls.style.display = 'none';
        recordBtn.textContent = 'Start Recording';
        timerDisplay.textContent = '00:00';
        timerDisplay.style.display = 'none';
        
        // Restart camera
        initCamera();
    });
    
    // Delete video
    deleteBtn.addEventListener('click', () => {
        // Switch back to camera view
        videoFeed.style.display = 'block';
        recordedVideo.style.display = 'none';
        videoControls.style.display = 'flex';
        playbackControls.style.display = 'none';
        recordBtn.textContent = 'Start Recording';
        timerDisplay.textContent = '00:00';
        timerDisplay.style.display = 'none';
        
        // Clear recorded video
        recordedVideo.src = '';
        recordedChunks = [];
        
        // Restart camera
        initCamera();
    });
    
    // Download video
    downloadBtn.addEventListener('click', () => {
        if (recordedVideo.src) {
            const a = document.createElement('a');
            a.href = recordedVideo.src;
            a.download = `video_${new Date().toISOString()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
    
    // Initialize the camera when the page loads
    initCamera();
});