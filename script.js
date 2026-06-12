// ======================== SPLASH SCREEN ========================
const splash = document.getElementById('splashScreen');
const main = document.getElementById('mainContent');
const openBtn = document.getElementById('openInvitationBtn');

if (openBtn) {
    openBtn.addEventListener('click', () => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            main.style.display = 'block';
            document.body.style.overflow = 'auto';
            initAll(); // Panggil semua fungsi setelah konten muncul
        }, 800);
    });
} else {
    // fallback
    main.style.display = 'block';
    initAll();
}

function initAll() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initRSVP();
    initSlider();
    initMusic();
    initFadeUp();
    initCopyButtons();
    initGalleryClicks();
}

// ======================== AMBIL NAMA TAMU DARI URL ========================
function getNamaTamu() {
    const urlParams = new URLSearchParams(window.location.search);
    let nama = urlParams.get('to');
    if (nama) {
        // Bersihkan sedikit (encode)
        nama = decodeURIComponent(nama);
        return nama;
    }
    return null;
}

function tampilkanNamaTamu() {
    const nama = getNamaTamu();
    if (nama) {
        // Tampilkan di splash screen
        const salamTamu = document.getElementById('salamTamu');
        if (salamTamu) salamTamu.innerHTML = `Kepada Yth. <strong>${escapeHtml(nama)}</strong>`;
        
        // Tampilkan di hero setelah buka undangan
        const heroSalam = document.getElementById('heroSalam');
        if (heroSalam) heroSalam.innerHTML = `💝 Terhormat, ${escapeHtml(nama)} 💝`;
        
        // Isi otomatis form RSVP (opsional)
        const inputNama = document.getElementById('rsvpName');
        if (inputNama) inputNama.value = nama;
    }
}

// Panggil fungsi ini saat splash screen masih tampil (sebelum undangan dibuka)
tampilkanNamaTamu();

// ======================== COUNTDOWN ========================
function updateCountdown() {
    const weddingDate = new Date(2028, 5, 5, 8, 0, 0).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (86400000)) / (3600000));
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    document.getElementById('days').innerText = days < 0 ? '00' : days;
    document.getElementById('hours').innerText = hours < 0 ? '00' : hours;
    document.getElementById('minutes').innerText = minutes < 0 ? '00' : minutes;
    document.getElementById('seconds').innerText = seconds < 0 ? '00' : seconds;
}

// ======================== RSVP dengan localStorage ========================
const STORAGE_KEY = 'wedding_rsvp_list';
let rsvpData = [];

function loadRsvpData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        rsvpData = JSON.parse(stored);
    } else {
        rsvpData = [];
    }
    renderRsvpList();
}

function saveRsvpData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvpData));
}

function renderRsvpList() {
    const rsvpListDiv = document.getElementById('rsvpList');
    if (!rsvpListDiv) return;
    if (rsvpData.length === 0) {
        rsvpListDiv.innerHTML = '<p style="text-align:center; color:#aaa;">Belum ada konfirmasi. Jadilah yang pertama!</p>';
        return;
    }
    rsvpListDiv.innerHTML = '';
    [...rsvpData].reverse().forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'rsvp-item';
        div.innerHTML = `
            <button class="delete-btn" data-idx="${rsvpData.length - 1 - idx}" title="Hapus konfirmasi"><i class="fas fa-trash-alt"></i></button>
            <strong>${escapeHtml(item.name)}</strong>
            <span class="status ${item.attendance === 'Hadir' ? 'status-hadir' : 'status-tidak'}">${item.attendance}</span>
            <div style="font-size:0.8rem; color:#8a6c55;">${escapeHtml(item.email)}</div>
            <div class="message">"${escapeHtml(item.message || 'Tidak ada ucapan')}"</div>
            <div style="font-size:0.7rem; color:#bbaa99;">${item.date}</div>
        `;
        rsvpListDiv.appendChild(div);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const originalIdx = parseInt(btn.getAttribute('data-idx'));
            if (!isNaN(originalIdx) && originalIdx >= 0 && originalIdx < rsvpData.length) {
                rsvpData.splice(originalIdx, 1);
                saveRsvpData();
                renderRsvpList();
                const statusDiv = document.getElementById('rsvpStatus');
                if (statusDiv) {
                    statusDiv.innerHTML = '<i class="fas fa-check"></i> Satu konfirmasi telah dihapus.';
                    setTimeout(() => { statusDiv.innerHTML = ''; }, 2000);
                }
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function initRSVP() {
    loadRsvpData();
    const form = document.getElementById('rsvpForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvpName').value.trim();
        const email = document.getElementById('rsvpEmail').value.trim();
        const attendance = document.getElementById('rsvpAttendance').value;
        const message = document.getElementById('rsvpMessage').value.trim();

        if (!name || !email || !attendance) {
            const statusDiv = document.getElementById('rsvpStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Harap isi nama, email, dan kehadiran.';
                setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
            }
            return;
        }

        const newRsvp = {
            name: name,
            email: email,
            attendance: attendance,
            message: message || '',
            date: new Date().toLocaleString('id-ID')
        };
        rsvpData.push(newRsvp);
        saveRsvpData();
        renderRsvpList();

        form.reset();
        const statusDiv = document.getElementById('rsvpStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Konfirmasi terkirim! Terima kasih.';
            setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
        }
    });
}

// ======================== PREWEDDING SLIDER ========================
function initSlider() {
    const track = document.querySelector('.slider-track');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const nextBtn = document.getElementById('nextSlide');
    const prevBtn = document.getElementById('prevSlide');
    const dotsNav = document.getElementById('sliderDots');
    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let slideWidth = slides[0].getBoundingClientRect().width;

    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);

    const moveToSlide = (targetIndex) => {
        track.style.transform = 'translateX(-' + slideWidth * targetIndex + 'px)';
        updateDots(targetIndex);
        currentIndex = targetIndex;
    };

    const createDots = () => {
        if (!dotsNav) return;
        dotsNav.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                moveToSlide(idx);
            });
            dotsNav.appendChild(dot);
        });
    };
    createDots();

    const updateDots = (index) => {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        if (idx === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });
};

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % slides.length;
            moveToSlide(nextIndex);
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            moveToSlide(prevIndex);
        });
    }

    window.addEventListener('resize', () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, idx) => {
            slide.style.left = slideWidth * idx + 'px';
        });
        track.style.transform = 'translateX(-' + slideWidth * currentIndex + 'px)';
    });
}

// ==================== MUSIK ====================
function initMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    if (!music || !toggle) return;

    let musicPlaying = false;

    function playMusic() {
        music.play().then(() => {
            musicPlaying = true;
            toggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            console.log("Musik berjalan");
        }).catch(err => {
            console.log("Autoplay gagal:", err);
            toggle.innerHTML = '<i class="fas fa-music"></i>';
        });
    }

    function pauseMusic() {
        music.pause();
        musicPlaying = false;
        toggle.innerHTML = '<i class="fas fa-music"></i>';
    }

    toggle.addEventListener('click', () => {
        if (musicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    window.playWeddingMusic = playMusic;
}

// Gunakan openBtn yang sudah didefinisikan di awal (jangan deklarasi ulang)
if (typeof openBtn !== 'undefined' && openBtn) {
    openBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (typeof window.playWeddingMusic === 'function') {
                window.playWeddingMusic();
            }
        }, 600);
    });
} else {
    console.warn("Tombol openInvitationBtn tidak ditemukan");
}

// ==================== FADE UP ON SCROLL ===================
function initFadeUp() {
    const faders = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    faders.forEach(fader => observer.observe(fader));
}

// ======================== COPY REKENING ========================
function initCopyButtons() {
    const btns = document.querySelectorAll('.copy-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const acc = btn.getAttribute('data-account');
            if (acc) {
                navigator.clipboard.writeText(acc).then(() => {
                    const original = btn.innerText;
                    btn.innerText = 'Tersalin!';
                    setTimeout(() => { btn.innerText = original; }, 2000);
                }).catch(() => alert('Gagal menyalin, silakan manual.'));
            }
        });
    });
}

// ======================== GALERI KLIK ========================
function initGalleryClicks() {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            alert('📸 Foto kenangan indah ✨');
        });
    });
}
