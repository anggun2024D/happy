// Konfigurasi tanggal spesial
const SPECIAL_DATE = 'Jan 04, 2026 21:08:00';

// Data untuk photo booth
const photoData = [
    {
        id: 1,
        imageUrl: "images/foto1.JPG",  
        caption: "Ayah dengan 2 princessnya"
    },
    {
        id: 2,
        imageUrl: "images/foto2.JPG",
        caption: "Ayah dan si manyun"
    },
    {
        id: 3,
        imageUrl: "images/foto3.jpg",  
        caption: "Ayah Gantengg 😎"
    },
    {
        id: 4,
        imageUrl: "images/foto4.jpg",
        caption: "Ayah & Ama Makan Burger"
    },
    {
        id: 5,
        imageUrl: "images/foto5.jpg",
        caption: "Ayah & Princess ketiganya"
    },
    {
        id: 6,
        imageUrl: "images/foto6.jpg",
        caption: "Kembar Bertigaa"
    },
    {
        id: 7,
        imageUrl: "images/foto7.jpg",
        caption: "Ayah & Si Sulung"
    },
    {
        id: 8,
        imageUrl: "images/foto8.jpg",
        caption: "Ayah & Ama & LOve-nya"
    },
    {
        id: 9,
        imageUrl: "images/foto9.jpg",
        caption: "Ayah with anak lananngnya"
    },
    {
        id: 10,
        imageUrl: "images/foto10.jpg",
        caption: "Mantai Dolooo"
    }
];

// State aplikasi
const appState = {
    currentPage: 'countdownPage',
    musicPlaying: false,
    currentPhotoIndex: 0,
    videoPlaying: false,
    videoMuted: false,
    countdownActive: true,
    celebrationStarted: false,
    loadingProgress: 0,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    photoboxMachine: null,
    typewriter: null
};

// Cache DOM elements
let elements = {};
let countdownInterval = null;
let particleSystem = null;
let confettiSystem = null;
const imageCache = new Map();

// Teks surat lengkap
const letterText = `Halo Ayah... ✨

Tenang dulu... 
Ini bukan tagihan listrik. 😆
Bukan juga daftar belanja bulanan.

Ini cuma surat kecil dari anakmu,
yang pengen bilang terima kasih...

Terima kasih karena Ayah selalu ada,
jadi sopir andalan keluarga,
ahli ngopi yang paling jago,
montir handal yang bisa perbaiki apa aja.

Kadang Ayah keliatan santai,
padahal capeknya banyak,
mikirnya jauh ke depan.

Tapi tetap bisa ketawa bareng kami,
tetap bangun pagi buat kerja,
tetap kuat jadi tiang keluarga.

Seperti kopi yang selalu setia
menemani pagi Ayah...

Makasih ya, Yah...
Untuk semua yang udah Ayah lakukan,
untuk semua yang Ayah korbankan,
untuk semua cinta yang Ayah beri.

Kami bangga punya Ayah.
Anak-anak Ayah sayang banget. 💕`;

// ========== INITIALIZATION ==========
async function init() {
    console.log('🎉 Memulai Happy Dad Moment...');
    
    try {
        // Setup semua elemen DOM
        setupElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Preload images dan audio
        await Promise.all([
            preloadImages(),
            preloadAudio()
        ]);
        
        // Setup canvas systems
        setupCanvasSystems();
        
        // Start countdown
        startCountdown();
        
        // Hide loading dengan animasi
        hideLoading();
        
        console.log('✅ Happy Dad Moment siap!');
        
    } catch (error) {
        console.error('❌ Error inisialisasi:', error);
        showToast('Terjadi kesalahan saat memuat. Silakan refresh halaman.', 'error');
    }
}

// Fungsi baru untuk preload audio
async function preloadAudio() {
    return new Promise((resolve, reject) => {
        if (!elements.bgMusic) {
            resolve();
            return;
        }
        
        console.log('Preloading audio...');
        
        elements.bgMusic.addEventListener('canplaythrough', () => {
            console.log('✅ Audio siap diputar');
            resolve();
        }, { once: true });
        
        elements.bgMusic.addEventListener('error', (e) => {
            console.error('❌ Audio load error:', e);
            console.error('Audio error details:', elements.bgMusic.error);
            showToast('File musik tidak ditemukan. Pastikan file "audio/background-music.mp3" ada.', 'error');
            resolve(); // Jangan reject, biarkan app tetap jalan
        });
        
        // Load audio
        elements.bgMusic.load();
    });
}

// ========== DOM ELEMENTS SETUP ==========
function setupElements() {
    elements = {
        // Pages
        pages: {
            countdownPage: document.getElementById('countdownPage'),
            openingPage: document.getElementById('openingPage'),
            letterPage: document.getElementById('letterPage'),
            transitionPage: document.getElementById('transitionPage'),
            photoboothPage: document.getElementById('photoboothPage'),
            videoPage: document.getElementById('videoPage'),
            prayerPage: document.getElementById('prayerPage'),
            closingPage: document.getElementById('closingPage')
        },
        
        // Countdown elements
        day: document.getElementById('day'),
        hour: document.getElementById('hour'),
        minute: document.getElementById('minute'),
        second: document.getElementById('second'),
        skipCountdownBtn: document.getElementById('skipCountdownBtn'),
        testBtn: document.getElementById('testBtn'),
        
        // Gift box
        giftBox: document.getElementById('giftBox'),
        backToCountdown: document.getElementById('backToCountdown'),
        
        // Letter elements
        backToOpening: document.getElementById('backToOpening'),
        nextToTransition: document.getElementById('nextToTransition'),
        backToLetter: document.getElementById('backToLetter'),
        typewriter: document.getElementById('typewriter'),
        
        // Transition elements
        openPhotoboothBtn: document.getElementById('openPhotoboothBtn'),
        
        // Photobooth elements
        backToTransition: document.getElementById('backToTransition'),
        startSessionBtn: document.getElementById('startSessionBtn'),
        printBtn: document.getElementById('printBtn'),
        statusText: document.getElementById('statusText'),
        photoPreview: document.getElementById('photoPreview'),
        framesContainer: document.getElementById('framesContainer'),
        
        // Video elements
        backToPhotobooth: document.getElementById('backToPhotobooth'),
        nextToVideo: document.getElementById('nextToVideo'),
        birthdayVideo: document.getElementById('birthdayVideo'),
        playOverlay: document.querySelector('.play-overlay'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        muteBtn: document.getElementById('muteBtn'),
        fullscreenBtn: document.getElementById('fullscreenBtn'),
        
        // Prayer elements
        backToVideo: document.getElementById('backToVideo'),
        nextToPrayer: document.getElementById('nextToPrayer'),
        nextToClosing: document.getElementById('nextToClosing'),
        
        // Closing elements
        restartBtn: document.getElementById('restartBtn'),
        shareBtn: document.getElementById('shareBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        
        // Music elements
        bgMusic: document.getElementById('bgMusic'),
        
        // Modal elements
        shareModal: document.getElementById('shareModal'),
        copyLinkBtn: document.getElementById('copyLinkBtn'),
        shareUrl: document.getElementById('shareUrl'),
        shareWhatsApp: document.getElementById('shareWhatsApp'),
        shareTelegram: document.getElementById('shareTelegram'),
        modalClose: document.querySelector('.modal-close'),
        
        // Loading elements
        loadingOverlay: document.getElementById('loadingOverlay'),
        progressFill: document.querySelector('.progress-fill'),
        loadingPercentage: document.querySelector('.loading-percentage'),
        
        // Progress bar
        progressBar: document.getElementById('progressBar'),
        
        // Canvas
        backgroundCanvas: document.getElementById('backgroundCanvas'),
        confettiCanvas: document.getElementById('confettiCanvas'),
        
        // Toast
        toast: document.getElementById('toast')
    };
}

// ========== EVENT LISTENERS SETUP ==========
function setupEventListeners() {
    // Countdown navigation
    if (elements.skipCountdownBtn) {
        elements.skipCountdownBtn.addEventListener('click', startCelebration);
    }
    
    if (elements.testBtn) {
        elements.testBtn.addEventListener('click', () => {
            SPECIAL_DATE = new Date(Date.now() + 3000).toString();
            startCelebration();
        });
    }
    
    // Gift box
    if (elements.giftBox) {
        elements.giftBox.addEventListener('click', openGift);
    }
    
    if (elements.backToCountdown) {
        elements.backToCountdown.addEventListener('click', () => navigateTo('countdownPage'));
    }
    
    // Letter navigation
    if (elements.backToOpening) {
        elements.backToOpening.addEventListener('click', () => navigateTo('openingPage'));
    }
    
    if (elements.nextToTransition) {
        elements.nextToTransition.addEventListener('click', () => navigateTo('transitionPage'));
    }
    
    if (elements.backToLetter) {
        elements.backToLetter.addEventListener('click', () => navigateTo('letterPage'));
    }
    
    // Transition navigation
    if (elements.openPhotoboothBtn) {
        elements.openPhotoboothBtn.addEventListener('click', () => {
            confettiSystem?.burst(100);
            setTimeout(() => navigateTo('photoboothPage'), 800);
        });
    }
    
    // Photobooth navigation
    if (elements.backToTransition) {
        elements.backToTransition.addEventListener('click', () => navigateTo('transitionPage'));
    }
    
    if (elements.nextToVideo) {
        elements.nextToVideo.addEventListener('click', () => navigateTo('videoPage'));
    }
    
    // Video navigation
    if (elements.backToPhotobooth) {
        elements.backToPhotobooth.addEventListener('click', () => navigateTo('photoboothPage'));
    }
    
    if (elements.nextToPrayer) {
        elements.nextToPrayer.addEventListener('click', () => navigateTo('prayerPage'));
    }
    
    // Prayer navigation
    if (elements.nextToClosing) {
        elements.nextToClosing.addEventListener('click', () => navigateTo('closingPage'));
    }
    
    // Closing actions
    if (elements.restartBtn) {
        elements.restartBtn.addEventListener('click', restartApp);
    }
    
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', showShareModal);
    }
    
    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener('click', downloadMemories);
    }
    
    // Music controls
    document.addEventListener('click', (e) => {
        if (e.target.closest('.music-btn')) {
            toggleMusic();
        }
    });
    
    // Video controls
    if (elements.playOverlay) {
        elements.playOverlay.addEventListener('click', playVideo);
    }
    
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', toggleVideoPlayPause);
    }
    
    if (elements.muteBtn) {
        elements.muteBtn.addEventListener('click', toggleVideoMute);
    }
    
    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Photobooth controls
    if (elements.startSessionBtn) {
        elements.startSessionBtn.addEventListener('click', startPhotoboothSession);
    }
    
    if (elements.printBtn) {
        elements.printBtn.addEventListener('click', printPhotostrip);
    }
    
    // Modal controls
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', hideShareModal);
    }
    
    if (elements.copyLinkBtn) {
        elements.copyLinkBtn.addEventListener('click', copyShareLink);
    }
    
    if (elements.shareWhatsApp) {
        elements.shareWhatsApp.addEventListener('click', shareViaWhatsApp);
    }
    
    if (elements.shareTelegram) {
        elements.shareTelegram.addEventListener('click', shareViaTelegram);
    }
    
    // Social buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', handleSocialButtonClick);
    });
    
    // Window events
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('error', handleGlobalError);
}

// ========== CORE FUNCTIONS ==========
function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!appState.countdownActive) return;
    
    const now = new Date().getTime();
    const targetDate = new Date(SPECIAL_DATE).getTime();
    const distance = targetDate - now;

    if (distance <= 0 && !appState.celebrationStarted) {
        clearInterval(countdownInterval);
        startCelebration();
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (elements.day) elements.day.textContent = days.toString().padStart(2, '0');
    if (elements.hour) elements.hour.textContent = hours.toString().padStart(2, '0');
    if (elements.minute) elements.minute.textContent = minutes.toString().padStart(2, '0');
    if (elements.second) elements.second.textContent = seconds.toString().padStart(2, '0');
}

function startCelebration() {
    if (appState.celebrationStarted) return;
    
    appState.celebrationStarted = true;
    appState.countdownActive = false;
    
    // Confetti burst
    confettiSystem?.burst(200);
    
    // Auto-play music
    toggleMusic();
    
    // Navigasi ke halaman pembuka
    setTimeout(() => {
        navigateTo('openingPage');
    }, 1500);
}

function navigateTo(pageName) {
    if (!elements.pages[pageName]) {
        console.error(`Halaman ${pageName} tidak ditemukan`);
        return;
    }
    
    // Update progress bar
    updateProgressBar(pageName);
    
    // Hide current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        currentPage.classList.remove('active');
    }
    
    // Show new page
    setTimeout(() => {
        elements.pages[pageName].classList.add('active');
        window.scrollTo(0, 0);
        
        // Update page indicators
        updatePageIndicators(pageName);
        
        // Trigger page-specific actions
        handlePageNavigation(pageName);
        
        // Update app state
        appState.currentPage = pageName;
    }, 50);
}

function updateProgressBar(pageName) {
    if (!elements.progressBar) return;
    
    const pageOrder = [
        'countdownPage',
        'openingPage',
        'letterPage',
        'transitionPage',
        'photoboothPage',
        'videoPage',
        'prayerPage',
        'closingPage'
    ];
    
    const currentIndex = pageOrder.indexOf(pageName);
    if (currentIndex === -1) return;
    
    const progress = (currentIndex / (pageOrder.length - 1)) * 100;
    elements.progressBar.style.width = `${progress}%`;
}

function updatePageIndicators(pageName) {
    const indicators = document.querySelectorAll('.page-indicator span');
    if (!indicators.length) return;
    
    const pageIndexMap = {
        'countdownPage': 0,
        'openingPage': 0,
        'letterPage': 1,
        'transitionPage': 2,
        'photoboothPage': 3,
        'videoPage': 4,
        'prayerPage': 5,
        'closingPage': 6
    };
    
    const activeIndex = pageIndexMap[pageName] || 0;
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === activeIndex);
    });
}

function handlePageNavigation(pageName) {
    switch(pageName) {
        case 'letterPage':
            startLetterAnimation();
            break;
        case 'photoboothPage':
            initializePhotobox();
            break;
        case 'prayerPage':
            startPrayerAnimation();
            break;
        case 'videoPage':
            setupVideoEvents();
            break;
    }
}

// ========== GIFT BOX FUNCTIONS ==========
function openGift() {
    const giftBox = document.getElementById('giftBox');
    if (!giftBox) return;
    
    // Tambah class opened
    giftBox.classList.add('opened');
    
    // Confetti effect
    confettiSystem?.burst(100);
    
    // Play sound effect
    playGiftSound();
    
    // Navigasi ke halaman surat
    setTimeout(() => {
        navigateTo('letterPage');
    }, 1500);
}

function playGiftSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio context not supported');
    }
}

// ========== LETTER FUNCTIONS ==========
function startLetterAnimation() {
    const envelope = document.querySelector('.envelope');
    const letter = document.getElementById('letter');
    const nextButton = document.getElementById('nextToTransition');
    
    if (!envelope || !letter || !nextButton) return;
    
    console.log('Starting letter animation...');
    
    // Reset state
    if (appState.typewriter) {
        appState.typewriter.stop();
    }
    
    // Clear typewriter text
    if (elements.typewriter) {
        elements.typewriter.innerHTML = '';
    }
    
    // 1. Buka amplop
    setTimeout(() => {
        envelope.classList.add('open');
        console.log('Envelope opened');
    }, 500);
    
    // 2. Setelah amplop terbuka, mulai efek typewriter
    setTimeout(() => {
        console.log('Starting typewriter effect...');
        
        // Inisialisasi typewriter
        appState.typewriter = new Typewriter('typewriter', letterText, {
            speed: 40,
            onComplete: function() {
                console.log('Typewriter completed');
                
                // 3. Tampilkan tombol lanjut setelah selesai mengetik
                setTimeout(() => {
                    nextButton.classList.add('show');
                    console.log('Next button shown');
                }, 1000);
            }
        });
        
        // Mulai efek typewriter
        appState.typewriter.type();
        
    }, 1800);
    
    // Opsional: Efek suara amplop
    setTimeout(() => {
        playEnvelopeSound();
    }, 800);
}

function playEnvelopeSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ========== TYPEWRITER CLASS ==========
class Typewriter {
    constructor(elementId, text, options = {}) {
        this.element = document.getElementById(elementId);
        this.text = text;
        this.options = {
            speed: 50,
            cursor: '|',
            cursorBlinkSpeed: 500,
            onComplete: null,
            ...options
        };
        
        this.currentIndex = 0;
        this.isTyping = false;
        this.cursorVisible = true;
        this.cursorInterval = null;
        this.init();
    }
    
    init() {
        if (!this.element) return;
        
        this.element.innerHTML = '';
        this.cursorInterval = setInterval(() => {
            this.cursorVisible = !this.cursorVisible;
            this.updateCursor();
        }, this.options.cursorBlinkSpeed);
    }
    
    updateCursor() {
        const cursorSpan = this.element.querySelector('.typewriter-cursor');
        if (cursorSpan) {
            cursorSpan.style.opacity = this.cursorVisible ? '1' : '0';
        }
    }
    
    type() {
        if (this.isTyping || !this.element) return;
        
        this.isTyping = true;
        this.currentIndex = 0;
        
        // Hapus cursor interval lama
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
        
        // Tambah cursor
        this.element.innerHTML += `<span class="typewriter-cursor">${this.options.cursor}</span>`;
        
        // Mulai efek ketik
        this.typeNextCharacter();
    }
    
    typeNextCharacter() {
        if (this.currentIndex < this.text.length) {
            const char = this.text.charAt(this.currentIndex);
            const cursorSpan = this.element.querySelector('.typewriter-cursor');
            
            if (cursorSpan) {
                cursorSpan.insertAdjacentHTML('beforebegin', char === '\n' ? '<br>' : char);
            }
            
            this.currentIndex++;
            
            // Kecepatan ketik bervariasi
            const speed = char === '\n' ? this.options.speed * 2 : 
                         [',', '.', '!', '?'].includes(char) ? this.options.speed * 3 : 
                         this.options.speed;
            
            const variedSpeed = speed + (Math.random() * 20 - 10);
            
            setTimeout(() => this.typeNextCharacter(), variedSpeed);
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.isTyping = false;
        
        const cursorSpan = this.element.querySelector('.typewriter-cursor');
        if (cursorSpan) {
            let blinkCount = 0;
            const finalBlink = setInterval(() => {
                cursorSpan.style.opacity = cursorSpan.style.opacity === '1' ? '0' : '1';
                blinkCount++;
                
                if (blinkCount >= 6) {
                    clearInterval(finalBlink);
                    cursorSpan.style.display = 'none';
                    
                    if (this.options.onComplete) {
                        this.options.onComplete();
                    }
                }
            }, 300);
        }
    }
    
    stop() {
        this.isTyping = false;
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
    }
    
    skip() {
        if (!this.isTyping || !this.element) return;
        
        const cursorSpan = this.element.querySelector('.typewriter-cursor');
        if (cursorSpan) {
            cursorSpan.remove();
        }
        
        this.element.innerHTML = this.text.replace(/\n/g, '<br>');
        this.isTyping = false;
        
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }
}

// ========== PHOTOBOOTH FUNCTIONS ==========
function initializePhotobox() {
    console.log('Initializing photobox...');
    
    // Reset frames
    const frames = document.querySelectorAll('.photo-frame');
    frames.forEach(frame => {
        frame.innerHTML = `
            <div class="frame-number">${frame.dataset.frame}</div>
            <div class="frame-status">READY</div>
        `;
        frame.classList.remove('filled');
    });
    
    // Reset preview
    if (elements.photoPreview) {
        elements.photoPreview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-smile"></i>
                <p>Siap-siap senyum, Yah! 😄</p>
                <p class="preview-hint">Tekan START untuk mulai!</p>
            </div>
        `;
    }
    
    // Reset buttons
    if (elements.startSessionBtn) {
        elements.startSessionBtn.disabled = false;
        elements.startSessionBtn.innerHTML = '<i class="fas fa-play-circle"></i><span>START SESSION</span>';
    }
    
    if (elements.printBtn) {
        elements.printBtn.disabled = true;
        elements.printBtn.innerHTML = '<i class="fas fa-print"></i><span>PRINT STRIP</span>';
    }
    
    // Update status
    updatePhotoboxStatus("READY FOR FUN TIMES");
}

function updatePhotoboxStatus(text) {
    if (elements.statusText) {
        elements.statusText.textContent = text;
        elements.statusText.style.animation = 'none';
        setTimeout(() => {
            elements.statusText.style.animation = 'typing 0.5s steps(40, end)';
        }, 10);
    }
}

function startPhotoboothSession() {
    if (appState.photoboxMachine?.isSessionActive) return;
    
    console.log('Starting photobooth session...');
    
    // Disable start button
    if (elements.startSessionBtn) {
        elements.startSessionBtn.disabled = true;
        elements.startSessionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PROCESSING...</span>';
    }
    
    // Enable print button
    if (elements.printBtn) {
        elements.printBtn.disabled = false;
    }
    
    // Reset frames
    const frames = document.querySelectorAll('.photo-frame');
    frames.forEach(frame => {
        frame.classList.remove('filled');
        frame.innerHTML = `
            <div class="frame-number">${frame.dataset.frame}</div>
            <div class="frame-status">READY</div>
        `;
    });
    
    // Start countdown
    let countdown = 3;
    updatePhotoboxStatus(`GET READY IN... ${countdown}`);
    
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown > 0) {
            updatePhotoboxStatus(`GET READY IN... ${countdown}`);
            playCountdownSound();
        } else {
            clearInterval(countdownInterval);
            updatePhotoboxStatus("SMILE! 📸");
            setTimeout(() => {
                startPhotoCapture();
            }, 1000);
        }
    }, 1000);
}

function playCountdownSound() {
    try {
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function startPhotoCapture() {
    updatePhotoboxStatus("CAPTURING MEMORIES...");
    
    let currentPhotoIndex = 0;
    const totalPhotos = 10;
    
    const captureInterval = setInterval(() => {
        if (currentPhotoIndex < totalPhotos) {
            capturePhoto(currentPhotoIndex);
            currentPhotoIndex++;
        } else {
            clearInterval(captureInterval);
            completeSession();
        }
    }, 2000);
}

function capturePhoto(index) {
    const photo = photoData[index];
    const frame = document.querySelector(`.photo-frame[data-frame="${index + 1}"]`);
    
    if (!frame || !photo) return;
    
    // Flash effect
    triggerFlash();
    
    // Play shutter sound
    playShutterSound();
    
    // Update frame after flash
    setTimeout(() => {
        frame.classList.add('filled');
        frame.innerHTML = `
            <div class="frame-number">${frame.dataset.frame}</div>
            <img src="${photo.imageUrl}" alt="${photo.caption}" class="frame-image">
            <div class="frame-caption">${photo.caption}</div>
        `;
        
        // Update preview
        updatePhotoPreview(photo);
        
        // Update status
        updatePhotoboxStatus(`CAPTURED: ${index + 1}/${photoData.length}`);
        
    }, 300);
}

function triggerFlash() {
    const flash = document.createElement('div');
    flash.className = 'flash-effect';
    const previewArea = document.querySelector('.preview-area');
    if (previewArea) {
        previewArea.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode === previewArea) {
                previewArea.removeChild(flash);
            }
        }, 500);
    }
}

function playShutterSound() {
    try {
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function updatePhotoPreview(photo) {
    if (elements.photoPreview) {
        elements.photoPreview.innerHTML = `
            <img src="${photo.imageUrl}" alt="${photo.caption}" class="frame-image" style="width: 100%; height: 100%; object-fit: cover;">
            <div class="frame-caption" style="position: absolute; bottom: 0; width: 100%;">${photo.caption}</div>
        `;
    }
}

function completeSession() {
    console.log('Photobooth session completed');
    
    // Update status
    updatePhotoboxStatus("🎉 SESSION COMPLETE! 🎉");
    
    // Update buttons
    if (elements.startSessionBtn) {
        elements.startSessionBtn.disabled = false;
        elements.startSessionBtn.innerHTML = '<i class="fas fa-redo"></i><span>START AGAIN</span>';
    }
    
    // Show completion message
    setTimeout(() => {
        if (elements.photoPreview) {
            elements.photoPreview.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-trophy"></i>
                    <p>Semua foto sudah siap! 🎉</p>
                    <p class="preview-hint">Tekan PRINT untuk menyimpan kenangan</p>
                </div>
            `;
        }
    }, 2000);
}

function printPhotostrip() {
    console.log('Printing photostrip...');
    
    // Update status
    updatePhotoboxStatus("PRINTING PHOTOSTRIP...");
    
    if (elements.printBtn) {
        elements.printBtn.disabled = true;
        elements.printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PRINTING...</span>';
    }
    
    // Add printing animation
    const photostrip = document.querySelector('.photostrip');
    if (photostrip) {
        photostrip.classList.add('printing');
    }
    
    // Simulate printing
    setTimeout(() => {
        completePrinting();
    }, 3000);
}

function completePrinting() {
    // Update status
    updatePhotoboxStatus("🎞️ PHOTOSTRIP READY! 🎞️");
    
    // Update print button
    if (elements.printBtn) {
        elements.printBtn.disabled = false;
        elements.printBtn.innerHTML = '<i class="fas fa-download"></i><span>DOWNLOAD</span>';
        
        // Change to download functionality
        elements.printBtn.onclick = downloadPhotostrip;
    }
    
    // Remove printing animation
    const photostrip = document.querySelector('.photostrip');
    if (photostrip) {
        photostrip.classList.remove('printing');
    }
}

function downloadPhotostrip() {
    alert('Photostrip berhasil disimpan! 🎉\n\nFotostrip dengan 10 kenangan spesial sudah disimpan ke perangkat Anda.');
    
    // Reset print button
    setTimeout(() => {
        if (elements.printBtn) {
            elements.printBtn.innerHTML = '<i class="fas fa-print"></i><span>PRINT AGAIN</span>';
            elements.printBtn.onclick = printPhotostrip;
        }
        updatePhotoboxStatus("DOWNLOAD COMPLETE! ✅");
    }, 2000);
}

// ========== VIDEO FUNCTIONS ==========
function setupVideoEvents() {
    if (!elements.birthdayVideo) return;
    
    // Tunggu iframe siap
    elements.birthdayVideo.addEventListener('load', () => {
        console.log('YouTube iframe loaded');
        
        // Setup YouTube Player API jika diperlukan
        if (typeof YT !== 'undefined' && YT.Player) {
            setupYouTubePlayer();
        }
    });
    
    elements.birthdayVideo.addEventListener('error', (e) => {
        console.error('YouTube video error:', e);
        showToast('Gagal memuat video YouTube. Coba refresh halaman atau buka link alternatif.', 'error');
        
        // Tampilkan pesan alternatif
        const videoPlayer = document.querySelector('.video-player');
        if (videoPlayer) {
            const fallbackMessage = `
                <div class="video-fallback" style="text-align: center; padding: 40px; background: rgba(0,0,0,0.5); border-radius: 15px;">
                    <i class="fas fa-video-slash" style="font-size: 60px; color: #FFD700; margin-bottom: 20px;"></i>
                    <h3 style="color: white; margin-bottom: 15px;">Video tidak dapat dimuat</h3>
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 25px;">
                        Silakan buka video melalui tautan berikut:
                    </p>
                    <a href="https://www.youtube.com/watch?v=54fuGcJmmhg" 
                       target="_blank" 
                       style="display: inline-block; background: linear-gradient(135deg, #8B0F0F, #c0392b); 
                              color: white; padding: 15px 30px; border-radius: 50px; 
                              text-decoration: none; font-weight: bold; font-size: 18px;">
                        <i class="fab fa-youtube"></i> Tonton di YouTube
                    </a>
                </div>
            `;
            videoPlayer.innerHTML = fallbackMessage;
        }
    });
}

// Fungsi untuk setup YouTube Player API (opsional)
function setupYouTubePlayer() {
    try {
        // Hanya jika menggunakan YouTube Player API
        const player = new YT.Player('birthdayVideo', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    } catch (error) {
        console.log('YouTube Player API tidak tersedia:', error);
    }
}

function onPlayerReady(event) {
    console.log('YouTube Player ready');
}

function onPlayerStateChange(event) {
    // Status YouTube player:
    // -1: belum dimulai
    // 0: selesai
    // 1: diputar
    // 2: dijeda
    // 3: buffering
    // 5: di-cued
    
    if (event.data === YT.PlayerState.PLAYING) {
        handleVideoPlay();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        handleVideoPause();
    }
}

function playVideo() {
    if (!elements.birthdayVideo) return;
    
    try {
        // Untuk iframe YouTube, kita tidak bisa langsung memanggil .play()
        // Coba fokus dan trigger click pada iframe
        elements.birthdayVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    } catch (e) {
        console.log('Gagal memutar video:', e);
        // Buka video di tab baru sebagai fallback
        window.open('https://www.youtube.com/watch?v=54fuGcJmmhg', '_blank');
    }
}

// ========== PRAYER FUNCTIONS ==========
function startPrayerAnimation() {
    const lines = document.querySelectorAll('.prayer-line');
    
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(10px)';
        line.style.animation = 'none';
        
        void line.offsetWidth;
        
        setTimeout(() => {
            line.style.animation = `fadeInUp 0.5s ease ${index * 0.3}s forwards`;
        }, 100);
    });
    
    // Create falling stars
    createFallingStars();
}

function createFallingStars() {
    const container = document.querySelector('.falling-stars');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('span');
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${3 + Math.random() * 5}s`;
        container.appendChild(star);
    }
}

// ========== MUSIC FUNCTIONS ==========
function toggleMusic() {
    if (!elements.bgMusic) return;
    
    // Cek jika audio sudah dimuat
    if (elements.bgMusic.readyState < 3) {
        console.log('Audio sedang loading...');
        showToast('Memuat musik...', 'info');
        
        // Coba load manual
        elements.bgMusic.load();
        
        // Coba play setelah load
        elements.bgMusic.oncanplaythrough = function() {
            playAudio();
        };
        
        // Timeout fallback
        setTimeout(() => {
            if (elements.bgMusic.readyState >= 3) {
                playAudio();
            } else {
                showToast('Gagal memuat musik. Pastikan file audio ada.', 'error');
                console.error('Audio gagal load:', elements.bgMusic.error);
            }
        }, 2000);
        
        return;
    }
    
    // Jika sudah dimuat, toggle play/pause
    if (appState.musicPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    if (!elements.bgMusic) return;
    
    elements.bgMusic.volume = 0.3;
    elements.bgMusic.play().then(() => {
        appState.musicPlaying = true;
        updateMusicIcons(true);
        console.log('Audio playing from local file');
    }).catch(e => {
        console.error('Audio play failed:', e);
        
        // Fallback strategies
        if (e.name === 'NotAllowedError') {
            showToast('Autoplay diblokir. Tekan tombol speaker untuk memutar.', 'warning');
            
            // User interaction required
            document.addEventListener('click', function playOnClick() {
                elements.bgMusic.play().then(() => {
                    appState.musicPlaying = true;
                    updateMusicIcons(true);
                    document.removeEventListener('click', playOnClick);
                }).catch(err => {
                    console.log('Still blocked:', err);
                });
            }, { once: true });
        } else {
            showToast('Gagal memutar musik. Cek file audio.', 'error');
        }
    });
}

function pauseAudio() {
    if (!elements.bgMusic) return;
    
    elements.bgMusic.pause();
    appState.musicPlaying = false;
    updateMusicIcons(false);
}

function updateMusicIcons(playing) {
    const icon = playing ? 'fa-volume-up' : 'fa-volume-mute';
    const text = playing ? 'Matikan Musik' : 'Nyalakan Musik';
    const musicButtons = document.querySelectorAll('.music-btn i');
    
    musicButtons.forEach(btn => {
        btn.className = `fas ${icon}`;
        btn.parentElement.title = text;
    });
    
    // Update button classes
    document.querySelectorAll('.music-btn').forEach(btn => {
        btn.classList.toggle('muted', !playing);
    });
}

// ========== SHARE FUNCTIONS ==========
function showShareModal() {
    if (elements.shareModal) {
        elements.shareModal.classList.add('active');
        if (elements.shareUrl) {
            elements.shareUrl.value = window.location.href;
        }
        document.body.style.overflow = 'hidden';
    }
}

function hideShareModal() {
    if (elements.shareModal) {
        elements.shareModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function copyShareLink() {
    if (!elements.shareUrl) return;
    
    elements.shareUrl.select();
    elements.shareUrl.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Link berhasil disalin!', 'success');
            
            // Update button text temporarily
            const originalText = elements.copyLinkBtn.textContent;
            elements.copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
            elements.copyLinkBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            
            setTimeout(() => {
                elements.copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Salin';
                elements.copyLinkBtn.style.background = '';
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Gagal menyalin link', 'error');
    }
}

function shareViaWhatsApp() {
    const text = `Halo Ayah! Aku buatkan hadiah digital spesial untuk Ayah 🎁\n\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareViaTelegram() {
    const text = `Halo Ayah! Aku buatkan hadiah digital spesial untuk Ayah 🎁\n\n${window.location.href}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function handleSocialButtonClick(e) {
    const btn = e.currentTarget;
    const type = btn.classList.contains('whatsapp') ? 'whatsapp' : 
                btn.classList.contains('telegram') ? 'telegram' : 'link';
    
    if (type === 'whatsapp') shareViaWhatsApp();
    else if (type === 'telegram') shareViaTelegram();
    else showShareModal();
}

// ========== UTILITY FUNCTIONS ==========
async function preloadImages() {
    const images = photoData.map(photo => photo.imageUrl);
    const promises = images.map((url) => {
        return new Promise((resolve, reject) => {
            if (imageCache.has(url)) {
                resolve();
                return;
            }
            
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                imageCache.set(url, img);
                updateLoadingProgress();
                resolve();
            };
            img.onerror = () => {
                console.warn(`Gagal memuat gambar: ${url}`);
                resolve();
            };
            img.src = url;
        });
    });
    
    return Promise.allSettled(promises);
}

function updateLoadingProgress() {
    const loaded = imageCache.size;
    const total = photoData.length;
    appState.loadingProgress = (loaded / total) * 100;
    
    if (elements.progressFill && elements.loadingPercentage) {
        elements.progressFill.style.width = `${appState.loadingProgress}%`;
        elements.loadingPercentage.textContent = `${Math.round(appState.loadingProgress)}%`;
    }
}

function hideLoading() {
    setTimeout(() => {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                elements.loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 1500);
}

function setupCanvasSystems() {
    if (elements.backgroundCanvas && elements.confettiCanvas) {
        // Simple particle system
        const ctx1 = elements.backgroundCanvas.getContext('2d');
        const ctx2 = elements.confettiCanvas.getContext('2d');
        
        elements.backgroundCanvas.width = window.innerWidth;
        elements.backgroundCanvas.height = window.innerHeight;
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
        
        // Simple background animation
        function animateBackground() {
            ctx1.clearRect(0, 0, elements.backgroundCanvas.width, elements.backgroundCanvas.height);
            
            // Draw gradient
            const gradient = ctx1.createRadialGradient(
                elements.backgroundCanvas.width / 2,
                elements.backgroundCanvas.height / 2,
                0,
                elements.backgroundCanvas.width / 2,
                elements.backgroundCanvas.height / 2,
                Math.max(elements.backgroundCanvas.width, elements.backgroundCanvas.height) / 2
            );
            
            gradient.addColorStop(0, 'rgba(139, 15, 15, 0.1)');
            gradient.addColorStop(1, 'transparent');
            
            ctx1.fillStyle = gradient;
            ctx1.fillRect(0, 0, elements.backgroundCanvas.width, elements.backgroundCanvas.height);
            
            requestAnimationFrame(animateBackground);
        }
        
        animateBackground();
        
        // Confetti system
        confettiSystem = {
            particles: [],
            burst: function(count = 150) {
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        x: Math.random() * elements.confettiCanvas.width,
                        y: -20,
                        size: Math.random() * 10 + 5,
                        speedX: (Math.random() - 0.5) * 10,
                        speedY: Math.random() * 10 + 5,
                        color: ['#8B0F0F', '#FF3333', '#FFFFFF', '#FFD700', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 6)],
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.2,
                        life: 100,
                        gravity: 0.5
                    });
                }
                
                this.animate();
            },
            animate: function() {
                ctx2.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);
                
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    p.speedY += p.gravity;
                    p.life -= 0.5;
                    
                    ctx2.save();
                    ctx2.translate(p.x, p.y);
                    ctx2.rotate(p.rotation);
                    ctx2.globalAlpha = Math.min(p.life / 100, 1);
                    ctx2.fillStyle = p.color;
                    ctx2.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx2.restore();
                    
                    if (p.life <= 0 || p.y > elements.confettiCanvas.height + 100) {
                        this.particles.splice(i, 1);
                    }
                }
                
                if (this.particles.length > 0) {
                    requestAnimationFrame(() => this.animate());
                }
            }
        };
    }
}

function showToast(message, type = 'info') {
    if (!elements.toast) return;
    
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function downloadMemories() {
    showToast('Fitur download akan segera hadir!', 'info');
}

function restartApp() {
    // Reset state
    appState.currentPhotoIndex = 0;
    appState.videoPlaying = false;
    appState.videoMuted = false;
    appState.countdownActive = true;
    appState.celebrationStarted = false;
    appState.photoboxMachine = null;
    
    // Reset UI
    if (elements.birthdayVideo) {
        elements.birthdayVideo.pause();
        elements.birthdayVideo.currentTime = 0;
        elements.birthdayVideo.muted = false;
    }
    
    if (elements.playOverlay) {
        elements.playOverlay.classList.remove('hidden');
    }
    
    // Reset gift box
    const giftBox = document.getElementById('giftBox');
    if (giftBox) {
        giftBox.classList.remove('opened');
    }
    
    // Reset progress bar
    updateProgressBar('countdownPage');
    
    // Kembali ke halaman countdown
    navigateTo('countdownPage');
    
    // Reset countdown
    updateCountdown();
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(updateCountdown, 1000);
    
    // Show restart toast
    showToast('Aplikasi di-restart!', 'success');
}

// ========== EVENT HANDLERS ==========
function handleResize() {
    if (elements.backgroundCanvas && elements.confettiCanvas) {
        elements.backgroundCanvas.width = window.innerWidth;
        elements.backgroundCanvas.height = window.innerHeight;
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
    }
    updateProgressBar(appState.currentPage);
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Jika tab tidak aktif, pause audio
        if (appState.musicPlaying && elements.bgMusic) {
            elements.bgMusic.pause();
            // Jangan update state agar bisa resume nanti
        }
        if (appState.videoPlaying && elements.birthdayVideo) {
            elements.birthdayVideo.pause();
        }
    } else {
        // Jika tab aktif kembali, resume audio
        if (appState.musicPlaying && elements.bgMusic) {
            elements.bgMusic.play().catch(e => {
                console.log('Audio resume blocked:', e);
            });
        }
    }
}

function handleGlobalError(e) {
    console.error('Global error:', e);
    if (elements.loadingOverlay) {
        const loadingText = elements.loadingOverlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = 'Terjadi kesalahan. Silakan refresh halaman.';
        }
    }
}

// ========== INITIALIZE APP ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle offline/online status
window.addEventListener('offline', () => {
    showToast('Koneksi internet terputus. Beberapa fitur mungkin tidak berfungsi.', 'warning');
});

window.addEventListener('online', () => {
    showToast('Koneksi internet kembali.', 'success');
});
