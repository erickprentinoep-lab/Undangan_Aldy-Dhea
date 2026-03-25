document.addEventListener('DOMContentLoaded', () => {

    // ===== Countdown Timer =====
    const weddingDate = new Date('2026-05-15T08:00:00+07:00').getTime();

    function updateCountdown() {
        const now = Date.now();
        const diff = weddingDate - now;

        if (diff <= 0) {
            ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            const label = document.querySelector('[data-cd-label]');
            if (label) label.textContent = '🎊 Hari Bahagia Telah Tiba!';
            return;
        }

        const pad = n => String(Math.floor(n)).padStart(2, '0');
        const days = diff / (1000 * 60 * 60 * 24);
        const hours = (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
        const mins = (diff % (1000 * 60 * 60)) / (1000 * 60);
        const secs = (diff % (1000 * 60)) / 1000;

        const d = document.getElementById('cd-days');
        const h = document.getElementById('cd-hours');
        const m = document.getElementById('cd-mins');
        const s = document.getElementById('cd-secs');
        if (d) d.textContent = pad(days);
        if (h) h.textContent = pad(hours);
        if (m) m.textContent = pad(mins);
        if (s) s.textContent = pad(secs);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    const btnOpen = document.getElementById('btn-open');
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicIcon = document.getElementById('music-icon');
    const rsvpStatus = document.getElementById('rsvp-status');
    const paxWrap = document.getElementById('pax-wrap');
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesBoard = document.getElementById('wishes-board');
    const wishesList = document.getElementById('wishes-list');

    let isPlaying = false;

    // ===== Read ?tamu= param =====
    const params = new URLSearchParams(window.location.search);
    const tamu = params.get('tamu');
    if (tamu) {
        const el = document.getElementById('nama-tamu');
        if (el) el.textContent = decodeURIComponent(tamu);
    }

    // ===== Open Invitation =====
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            // Animate button shrink & fade
            btnOpen.classList.add('scale-75', 'opacity-0', 'pointer-events-none', 'duration-500');
            
            // Animate text out
            const topText = document.querySelector('.slide-in-top');
            const bottomText = document.querySelector('.slide-in-bottom');
            if (topText) topText.classList.add('opacity-0', '-translate-y-5', 'transition-all', 'duration-700');
            if (bottomText) bottomText.classList.add('opacity-0', 'translate-y-5', 'transition-all', 'duration-700');

            // Wait a moment for texts to fade, then animate cover
            setTimeout(() => {
                cover.classList.add('closing');
                cover.addEventListener('animationend', () => {
                    cover.remove();
                    // Show main after cover is fully removed
                    mainContent.classList.remove('hidden');
                    setTimeout(() => mainContent.classList.add('visible'), 50);
                }, { once: true });

                // Show music button & play
                musicBtn.style.display = 'flex';
                tryPlay();
            }, 400);
        });
    }

    // ===== Music =====
    function tryPlay() {
        if (!bgMusic) return;
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
        }).catch(() => {
            isPlaying = false;
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
                musicBtn.classList.remove('playing');
            } else {
                bgMusic.play();
                isPlaying = true;
                musicBtn.classList.add('playing');
            }
        });
    }

    // ===== Scroll Reveal =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));

    // ===== RSVP Toggle Pax =====
    if (rsvpStatus) {
        rsvpStatus.addEventListener('change', () => {
            paxWrap.style.display = rsvpStatus.value === 'Hadir' ? 'block' : 'none';
        });
    }

    // ===== RSVP Submit =====
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('rsvp-name').value.trim();
            const status = rsvpStatus.value;
            const pax = document.getElementById('rsvp-pax').value;
            const message = document.getElementById('rsvp-message').value.trim();

            if (!name || !status) return;

            // --- Tampilkan ucapan di halaman ---
            if (wishesBoard) wishesBoard.classList.remove('hidden');
            const card = document.createElement('div');
            card.className = 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-1';
            card.innerHTML = `<p class="text-sm font-medium text-white">${name} <span class="text-[10px] text-gray-500 font-light ml-1">&middot; ${status}</span></p>${message ? `<p class="text-xs text-gray-400 italic">"${message}"</p>` : ''}`;
            wishesList.prepend(card);

            // --- Format pesan WhatsApp ---
            const phone = '6285223030232'; // ⚠️ Ganti dengan nomor WA tujuan

            const lines = [
                `🎊 *Konfirmasi Kehadiran*`,
                `Pernikahan Aldy & Dhea`,
                ``,
                `👤 *Nama:* ${name}`,
                `✅ *Kehadiran:* ${status}`,
            ];

            if (status === 'Hadir') {
                lines.push(`👥 *Jumlah Tamu:* ${pax} orang`);
            }

            if (message) {
                lines.push(``);
                lines.push(`💬 *Ucapan & Doa:*`);
                lines.push(`"${message}"`);
            }

            const waText = lines.join('\n');
            window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waText)}`, '_blank');

            rsvpForm.reset();
            if (paxWrap) paxWrap.style.display = 'block';
        });
    }


    // ===== Add to Calendar =====
    const calBtn = document.getElementById('add-to-calendar');
    if (calBtn) {
        calBtn.href = 'data:text/calendar;charset=utf8,' + encodeURIComponent([
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            'DTSTART:20250615T010000Z',
            'DTEND:20250615T060000Z',
            'SUMMARY:Pernikahan Resha & Rudi',
            'LOCATION:Villa Lagenta, Lembang, Bandung Barat',
            'DESCRIPTION:Akad: 08.00 WIB | Resepsi: 11.00 WIB',
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\n'));
        calBtn.setAttribute('download', 'undangan-aldy-dhea.ics');
    }

    // ===== Copy Rekening =====
    window.copyRek = function (id, btn) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = el.textContent.replace(/\s/g, ''); // hapus spasi
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = '✓ Tersalin!';
            btn.classList.add('text-green-400', 'border-green-400/40');
            setTimeout(() => {
                btn.textContent = orig;
                btn.classList.remove('text-green-400', 'border-green-400/40');
            }, 2000);
        }).catch(() => {
            // fallback for older browsers
            const range = document.createRange();
            range.selectNode(el);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            btn.textContent = '✓ Tersalin!';
            setTimeout(() => { btn.textContent = 'Salin'; }, 2000);
        });
    };

});

