// ==========================================================================
// INAYAH TAUFIKA AQILAH ♡ — JAVASCRIPT MEMORY BOOK ENGINE
// Clean, Modern, Animated, & Touch-Friendly
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ------------------------------------------------------------------------
  // 1. DATA HALAMAN & PRELOADING
  // ------------------------------------------------------------------------
  const pageNodes = document.querySelectorAll("#pageData > div");

  const pages = Array.from(pageNodes, (item, index) => ({
    index: index,
    time: Number(item.dataset.time) || 0,
    text: item.dataset.text || "",
    subtext: item.dataset.subtext || "",
    photo: item.dataset.photo || `foto/foto${index + 1}.jpeg`,
    caption: item.dataset.caption || "Momen Indah Bersamamu",
    color: item.dataset.color || "#ffe6ef",
    accent: item.dataset.accent || "#f06292"
  }));

  if (pages.length === 0) {
    console.warn("Data halaman tidak ditemukan di #pageData");
    return;
  }

  // Preload semua gambar foto ke memory agar perpindahan halaman mulus & instan
  pages.forEach((page) => {
    const img = new Image();
    img.src = page.photo;
  });

  // ------------------------------------------------------------------------
  // 2. REFERENSI ELEMEN DOM
  // ------------------------------------------------------------------------
  const textEl = document.getElementById("pageText");
  const subtextEl = document.getElementById("pageSubtext");
  const numberTagEl = document.getElementById("pageNumberTag");
  const photoEl = document.getElementById("pagePhoto");
  const photoCaptionEl = document.getElementById("photoCaption");
  const leftPage = document.getElementById("leftPage");
  const rightPage = document.getElementById("rightPage");
  const turningPage = document.getElementById("turningPage");
  const turnFront = document.getElementById("turnFront");
  const turnBack = document.getElementById("turnBack");
  const counterEl = document.getElementById("counter");
  const dotsContainer = document.getElementById("dotsContainer");

  const btnPrevSide = document.getElementById("btnPrevSide");
  const btnNextSide = document.getElementById("btnNextSide");
  const btnAutoplay = document.getElementById("btnAutoplay");
  const btnMusic = document.getElementById("btnMusic");
  const soundWave = document.getElementById("soundWave");
  const musicLabel = document.getElementById("musicLabel");
  const audio = document.getElementById("audio");

  const btnSpecialSurprise = document.getElementById("btnSpecialSurprise");
  const proposalModal = document.getElementById("proposalModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnYes = document.getElementById("btnYes");
  const btnSure = document.getElementById("btnSure");
  const modalActions = document.getElementById("modalActions");
  const modalCelebration = document.getElementById("modalCelebration");
  const toastNotification = document.getElementById("toastNotification");
  const bookScene = document.getElementById("bookScene");

  // State
  let currentPage = 0;
  let isAnimating = false;
  let animationTimer = null;
  let autoplayInterval = null;
  let isAutoplayActive = false;
  let isMusicPlaying = false;
  let toastTimer = null;

  // ------------------------------------------------------------------------
  // 3. GENERATE DOTS PAGINATION
  // ------------------------------------------------------------------------
  function createDots() {
    dotsContainer.innerHTML = "";
    pages.forEach((page, idx) => {
      const dot = document.createElement("button");
      dot.className = `page-dot ${idx === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Buka halaman ${idx + 1}`);
      dot.title = `Halaman ${idx + 1}: ${page.text}`;

      dot.addEventListener("click", () => {
        if (isAnimating || idx === currentPage) return;
        stopAutoplay();
        const dir = idx > currentPage ? 1 : -1;
        flipToPage(idx, dir);
      });

      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(index) {
    const dots = dotsContainer.querySelectorAll(".page-dot");
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add("active");
        dot.style.background = pages[index].accent;
        dot.style.boxShadow = `0 0 12px ${pages[index].accent}80`;
      } else {
        dot.classList.remove("active");
        dot.style.background = "";
        dot.style.boxShadow = "";
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. MENAMPILKAN HALAMAN (RENDER PAGE)
  // ------------------------------------------------------------------------
  function renderPage(index, animateContent = true) {
    if (index < 0 || index >= pages.length) return;

    const item = pages[index];

    // Update Counter & Badge
    if (counterEl) {
      counterEl.textContent = `Halaman ${index + 1} dari ${pages.length}`;
    }
    if (numberTagEl) {
      numberTagEl.textContent = `0${index + 1} / 0${pages.length}`;
    }

    // Update Tombol Navigasi Samping
    if (btnPrevSide) btnPrevSide.disabled = index === 0;
    if (btnNextSide) btnNextSide.disabled = index === pages.length - 1;

    // Transisi Konten
    if (animateContent) {
      textEl.style.opacity = "0";
      textEl.style.transform = "translateY(8px)";
      if (subtextEl) {
        subtextEl.style.opacity = "0";
        subtextEl.style.transform = "translateY(8px)";
      }
      photoEl.style.opacity = "0";
    }

    setTimeout(() => {
      // Perbarui Teks
      textEl.textContent = item.text;
      if (subtextEl) {
        subtextEl.textContent = item.subtext;
      }
      if (photoCaptionEl) {
        photoCaptionEl.textContent = item.caption;
      }

      // Perbarui Warna Halaman
      leftPage.style.background =
        `linear-gradient(145deg, ${item.color} 0%, #fffbfd 100%)`;
      rightPage.style.background =
        `linear-gradient(145deg, ${item.color} 0%, #ffffff 100%)`;

      // Perbarui Foto
      photoEl.onload = () => {
        photoEl.style.opacity = "1";
        photoEl.alt = `Foto kenangan halaman ${index + 1}: ${item.caption}`;
      };

      photoEl.onerror = () => {
        photoEl.style.opacity = "1";
        photoEl.alt = `Foto tidak ditemukan: ${item.photo}`;
      };

      photoEl.src = item.photo;

      if (photoEl.complete && photoEl.naturalWidth > 0) {
        photoEl.style.opacity = "1";
      }

      // Animasi Masuk Teks
      textEl.style.opacity = "1";
      textEl.style.transform = "translateY(0)";
      if (subtextEl) {
        subtextEl.style.opacity = "1";
        subtextEl.style.transform = "translateY(0)";
      }

      // Tombol Kejutan Spesial di Halaman Terakhir (Halaman 8)
      if (btnSpecialSurprise) {
        if (index === pages.length - 1) {
          btnSpecialSurprise.style.display = "inline-flex";
        } else {
          btnSpecialSurprise.style.display = "none";
        }
      }

      // Update dots
      updateDots(index);
    }, animateContent ? 140 : 0);
  }

  // ------------------------------------------------------------------------
  // 5. ANIMASI MEMBALIK BUKU 3D (PAGE FLIP ENGINE)
  // ------------------------------------------------------------------------
  function flipToPage(targetIndex, direction) {
    if (
      isAnimating ||
      targetIndex < 0 ||
      targetIndex >= pages.length ||
      targetIndex === currentPage
    ) {
      return;
    }

    isAnimating = true;

    const currentItem = pages[currentPage];
    const targetItem = pages[targetIndex];

    // Siapkan warna dan style lembaran balik
    if (direction > 0) {
      // Membalik ke depan (halaman kanan berpindah ke kiri)
      turnFront.style.background =
        `linear-gradient(145deg, ${currentItem.color} 0%, #ffffff 100%)`;
      turnBack.style.background =
        `linear-gradient(145deg, ${targetItem.color} 0%, #fffbfd 100%)`;

      turningPage.className = "turning-page";
      void turningPage.offsetWidth; // Force reflow
      turningPage.classList.add("active");
    } else {
      // Membalik ke belakang (halaman kiri berpindah ke kanan)
      turnFront.style.background =
        `linear-gradient(145deg, ${currentItem.color} 0%, #fffbfd 100%)`;
      turnBack.style.background =
        `linear-gradient(145deg, ${targetItem.color} 0%, #ffffff 100%)`;

      turningPage.className = "turning-page";
      void turningPage.offsetWidth;
      turningPage.classList.add("backward");
    }

    // Ganti data halaman saat lembaran berputar di titik tengah
    setTimeout(() => {
      currentPage = targetIndex;
      renderPage(currentPage, false);
    }, 380);

    // Selesaikan animasi
    clearTimeout(animationTimer);
    animationTimer = setTimeout(() => {
      turningPage.className = "turning-page";
      isAnimating = false;

      // Jika autoplay dan sudah sampai halaman akhir, hentikan
      if (isAutoplayActive && currentPage === pages.length - 1) {
        stopAutoplay();
        showToast("Sampai di akhir buku kenangan ♡");
      }
    }, 820);
  }

  function changePage(direction) {
    const target = currentPage + direction;
    if (target < 0 || target >= pages.length) return;
    flipToPage(target, direction);
  }

  // ------------------------------------------------------------------------
  // 6. EVENT LISTENER NAVIGASI & KLIK BUKU
  // ------------------------------------------------------------------------
  // Tombol Panah Samping
  if (btnPrevSide) {
    btnPrevSide.addEventListener("click", () => {
      stopAutoplay();
      changePage(-1);
    });
  }

  if (btnNextSide) {
    btnNextSide.addEventListener("click", () => {
      stopAutoplay();
      changePage(1);
    });
  }

  // Klik langsung pada lembar buku (Kiri = Mundur, Kanan = Maju)
  leftPage.addEventListener("click", (e) => {
    // Jangan picu balik jika mengklik tombol spesial atau hati
    if (e.target.closest("#btnSpecialSurprise") || e.target.closest("#heartPulse")) {
      return;
    }
    stopAutoplay();
    changePage(-1);
  });

  rightPage.addEventListener("click", (e) => {
    stopAutoplay();
    changePage(1);
  });

  // Navigasi Keyboard
  document.addEventListener("keydown", (event) => {
    if (event.repeat || isAnimating) return;

    // Jangan balik jika sedang mengetik di input
    if (
      event.target instanceof HTMLElement &&
      (
        event.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )
    ) {
      return;
    }

    if (event.code === "ArrowRight" || event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      stopAutoplay();
      changePage(1);
    } else if (event.code === "ArrowLeft" || event.code === "Backspace") {
      event.preventDefault();
      stopAutoplay();
      changePage(-1);
    }
  });

  // Navigasi Touch / Swipe untuk HP & Tablet
  let touchStartX = 0;
  let touchStartY = 0;

  if (bookScene) {
    bookScene.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    bookScene.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Pastikan gerakan lebih dominan horizontal daripada vertikal
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        stopAutoplay();
        if (diffX < 0) {
          // Geser ke kiri -> Halaman berikutnya
          changePage(1);
        } else {
          // Geser ke kanan -> Halaman sebelumnya
          changePage(-1);
        }
      }
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 7. INTERACTIVE FLOATING HEARTS (BURST PADA KLIK)
  // ------------------------------------------------------------------------
  function createBurstHearts(x, y) {
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
      const heart = document.createElement("span");
      heart.textContent = Math.random() > 0.4 ? "♡" : "💖";
      heart.style.position = "fixed";
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.fontSize = `${14 + Math.random() * 16}px`;
      heart.style.color = Math.random() > 0.5 ? "#f06292" : "#ff80ab";
      heart.style.pointerEvents = "none";
      heart.style.zIndex = "9999";
      heart.style.transition = "all 0.9s cubic-bezier(0.1, 0.8, 0.2, 1)";
      heart.style.opacity = "1";

      const angle = (Math.PI * 2 / burstCount) * i + (Math.random() - 0.5);
      const distance = 40 + Math.random() * 60;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - 30;

      document.body.appendChild(heart);

      requestAnimationFrame(() => {
        heart.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
        heart.style.opacity = "0";
      });

      setTimeout(() => heart.remove(), 950);
    }
  }

  const heartPulseEl = document.getElementById("heartPulse");
  if (heartPulseEl) {
    heartPulseEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = heartPulseEl.getBoundingClientRect();
      createBurstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }

  // ------------------------------------------------------------------------
  // 8. AUTO-PLAY / SLIDESHOW MODE
  // ------------------------------------------------------------------------
  function startAutoplay() {
    isAutoplayActive = true;
    if (btnAutoplay) {
      btnAutoplay.classList.add("active");
      const playIcon = btnAutoplay.querySelector(".icon-play");
      const pauseIcon = btnAutoplay.querySelector(".icon-pause");
      if (playIcon) playIcon.style.display = "none";
      if (pauseIcon) pauseIcon.style.display = "inline-block";
      const label = btnAutoplay.querySelector(".btn-label");
      if (label) label.textContent = "Jeda";
    }

    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      if (currentPage < pages.length - 1) {
        changePage(1);
      } else {
        stopAutoplay();
      }
    }, 4500);

    showToast("Mode auto putar aktif ✨");
  }

  function stopAutoplay() {
    if (!isAutoplayActive) return;
    isAutoplayActive = false;
    clearInterval(autoplayInterval);
    if (btnAutoplay) {
      btnAutoplay.classList.remove("active");
      const playIcon = btnAutoplay.querySelector(".icon-play");
      const pauseIcon = btnAutoplay.querySelector(".icon-pause");
      if (playIcon) playIcon.style.display = "inline-block";
      if (pauseIcon) pauseIcon.style.display = "none";
      const label = btnAutoplay.querySelector(".btn-label");
      if (label) label.textContent = "Auto Putar";
    }
  }

  if (btnAutoplay) {
    btnAutoplay.addEventListener("click", () => {
      if (isAutoplayActive) {
        stopAutoplay();
        showToast("Auto putar dijeda");
      } else {
        if (currentPage >= pages.length - 1) {
          // Jika sudah di akhir, kembali ke awal
          flipToPage(0, -1);
          setTimeout(() => startAutoplay(), 800);
        } else {
          startAutoplay();
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 9. AUDIO & MUSIK LATAR
  // ------------------------------------------------------------------------
  function toggleMusic() {
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      isMusicPlaying = false;
      btnMusic.classList.remove("playing", "active");
      if (musicLabel) musicLabel.textContent = "Musik";
      showToast("Musik dijeda");
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isMusicPlaying = true;
            btnMusic.classList.add("playing", "active");
            if (musicLabel) musicLabel.textContent = "Memutar";
            showToast("Memutar musik latar 🎵");
          })
          .catch((err) => {
            console.warn("Gagal memutar audio:", err);
            btnMusic.classList.remove("playing", "active");
            showToast("Tambahkan file 'lagu.mp3' di folder untuk memutar musik 🎵");
          });
      }
    }
  }

  if (btnMusic) {
    btnMusic.addEventListener("click", toggleMusic);
  }

  // Sinkronisasi Halaman jika Audio Memiliki Data Waktu
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      if (isAnimating || pages.length === 0 || !isMusicPlaying) return;

      let targetIdx = 0;
      for (let i = 0; i < pages.length; i++) {
        if (audio.currentTime >= pages[i].time) {
          targetIdx = i;
        } else {
          break;
        }
      }

      if (targetIdx !== currentPage) {
        const dir = targetIdx > currentPage ? 1 : -1;
        flipToPage(targetIdx, dir);
      }
    });

    audio.addEventListener("ended", () => {
      isMusicPlaying = false;
      if (btnMusic) btnMusic.classList.remove("playing", "active");
      if (musicLabel) musicLabel.textContent = "Musik";
    });
  }

  // ------------------------------------------------------------------------
  // 10. MODAL KEJUTAN ROMANTIS (HALAMAN 8)
  // ------------------------------------------------------------------------
  function openModal() {
    stopAutoplay();
    if (proposalModal) {
      proposalModal.classList.add("open");
      proposalModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeModal() {
    if (proposalModal) {
      proposalModal.classList.remove("open");
      proposalModal.setAttribute("aria-hidden", "true");
    }
  }

  if (btnSpecialSurprise) {
    btnSpecialSurprise.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal();
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeModal);
  }

  if (proposalModal) {
    proposalModal.addEventListener("click", (e) => {
      if (e.target === proposalModal) {
        closeModal();
      }
    });
  }

  // Efek Konfeti & Perayaan saat Menjawab Lamaran
  function triggerCelebration() {
    if (modalActions) modalActions.style.display = "none";
    if (modalCelebration) modalCelebration.style.display = "block";

    // Luncurkan konfeti & hati
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
        createBurstHearts(x, y);
      }, i * 45);
    }
  }

  if (btnYes) {
    btnYes.addEventListener("click", triggerCelebration);
  }

  if (btnSure) {
    btnSure.addEventListener("click", triggerCelebration);
  }

  // ------------------------------------------------------------------------
  // 11. TOAST NOTIFIKASI
  // ------------------------------------------------------------------------
  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 2800);
  }

  // ------------------------------------------------------------------------
  // 12. EFEK PARTIKEL SALJU, BINTANG & HATI MELAYANG
  // ------------------------------------------------------------------------
  const particlesContainer = document.getElementById("particles-container");

  function createParticles(amount = 75) {
    if (!particlesContainer) return;
    particlesContainer.innerHTML = "";

    const types = [
      { char: "❄", class: "snow" },
      { char: "❅", class: "snow" },
      { char: "✧", class: "sparkle" },
      { char: "✦", class: "sparkle" },
      { char: "♡", class: "heart" }
    ];

    for (let i = 0; i < amount; i++) {
      const p = document.createElement("span");
      const chosen = types[Math.floor(Math.random() * types.length)];

      p.className = `particle ${chosen.class}`;
      p.textContent = chosen.char;

      // Posisi horizontal
      p.style.left = `${Math.random() * 100}vw`;

      // Sebaran vertikal agar sudah terisi dari awal
      p.style.top = `${-Math.random() * 100}vh`;

      // Ukuran font variatif
      const size = chosen.class === "heart" ? 14 + Math.random() * 12 : 10 + Math.random() * 14;
      p.style.fontSize = `${size}px`;

      // Transparansi
      p.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);

      // Durasi & Jarak Gerak
      const duration = 7 + Math.random() * 9;
      p.style.animationDuration = `${duration}s`;
      p.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 140}px`);
      p.style.setProperty("--rot", `${Math.random() > 0.5 ? 360 : -360}deg`);

      particlesContainer.appendChild(p);
    }
  }

  // Inisialisasi Partikel
  const particleCount = Math.min(90, Math.max(40, Math.floor(window.innerWidth / 14)));
  createParticles(particleCount);

  // Resize Listener untuk partikel
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const updatedCount = Math.min(90, Math.max(40, Math.floor(window.innerWidth / 14)));
      createParticles(updatedCount);
    }, 300);
  });

  // ------------------------------------------------------------------------
  // 13. INISIALISASI AWAL
  // ------------------------------------------------------------------------
  createDots();
  renderPage(0, false);
});
