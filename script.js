document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cardWrapper = document.getElementById('cardWrapper');
  const businessCard = document.getElementById('businessCard');
  const toast = document.getElementById('toast');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const shareBtn = document.getElementById('shareBtn');
  const saveVcardBtn = document.getElementById('saveVcardBtn');
  const showQrBtn = document.getElementById('showQrBtn');
  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const qrImage = document.getElementById('qrImage');
  const copyButtons = document.querySelectorAll('.copy-btn');

  // Contact Information Data
  const profileData = {
    name: '이현주',
    company: '주식회사 지담',
    companyEn: 'JIDAM Inc.',
    title: '대표 / 비즈니스 디렉터',
    phone: '010-3412-6530',
    email: 'jidam2026@gmail.com',
    tagline: '신뢰와 가치를 담아 더 나은 미래를 함께 만듭니다.'
  };

  /* ==========================================================================
     1. Toast Notification
     ========================================================================== */
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> ${message}`;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  /* ==========================================================================
     2. Clipboard Copy Functionality
     ========================================================================== */
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`"${textToCopy}" 복사되었습니다.`);
        }).catch(() => {
          fallbackCopyText(textToCopy);
        });
      } else {
        fallbackCopyText(textToCopy);
      }
    });
  });

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`복사되었습니다.`);
    } catch (err) {
      showToast(`복사 실패. 직접 선택하여 복사해주세요.`);
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     3. 3D Tilt Card Effect (Desktop & Mobile Gyro)
     ========================================================================== */
  if (cardWrapper && businessCard) {
    let bounds;

    function rotateToMouse(e) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      // 회전 각도 제한
      const maxRotate = 9;
      const rotateX = (-center.y / (bounds.height / 2)) * maxRotate;
      const rotateY = (center.x / (bounds.width / 2)) * maxRotate;

      businessCard.style.transform = `
        rotateX(${rotateX.toFixed(2)}deg) 
        rotateY(${rotateY.toFixed(2)}deg) 
        translateZ(8px)
      `;
    }

    cardWrapper.addEventListener('mouseenter', () => {
      bounds = businessCard.getBoundingClientRect();
      document.addEventListener('mousemove', rotateToMouse);
    });

    cardWrapper.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', rotateToMouse);
      businessCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  }

  /* ==========================================================================
     4. Theme Toggle (Dark / Light)
     ========================================================================== */
  const savedTheme = localStorage.getItem('jidam_theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`${nextTheme === 'dark' ? '다크 모드' : '라이트 모드'}로 전환되었습니다.`);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jidam_theme', theme);
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
      icon.style.color = '#f59e0b';
    } else {
      icon.className = 'fa-solid fa-moon';
      icon.style.color = '';
    }
  }

  /* ==========================================================================
     5. Share Web Business Card
     ========================================================================== */
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: `${profileData.name} | ${profileData.company}`,
      text: `${profileData.company} ${profileData.name}의 웹 명함입니다. (${profileData.tagline})`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyPageUrl();
        }
      }
    } else {
      copyPageUrl();
    }
  });

  function copyPageUrl() {
    const currentUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('웹 명함 링크가 복사되었습니다!');
      });
    } else {
      fallbackCopyText(currentUrl);
    }
  }

  /* ==========================================================================
     6. vCard (.vcf) Contact Download
     ========================================================================== */
  saveVcardBtn.addEventListener('click', () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profileData.name}`,
      `N:${profileData.name};;;;`,
      `ORG:${profileData.company};`,
      `TITLE:${profileData.title}`,
      `TEL;TYPE=CELL,VOICE:${profileData.phone}`,
      `EMAIL;TYPE=PREF,INTERNET:${profileData.email}`,
      `NOTE:${profileData.tagline}`,
      `URL:${window.location.href}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${profileData.name}_${profileData.company}_명함.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('연락처 파일(.vcf)이 다운로드되었습니다.');
  });

  /* ==========================================================================
     7. QR Code Modal (vCard or Current URL)
     ========================================================================== */
  showQrBtn.addEventListener('click', () => {
    // QR Code API를 통한 직관적인 QR 생성 (현재 페이지 URL 또는 vCard 프로필)
    const currentUrl = window.location.href;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&margin=10`;
    qrImage.src = qrApiUrl;
    qrModal.classList.add('active');
    qrModal.setAttribute('aria-hidden', 'false');
  });

  function closeModal() {
    qrModal.classList.remove('active');
    qrModal.setAttribute('aria-hidden', 'true');
  }

  closeQrModal.addEventListener('click', closeModal);
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrModal.classList.contains('active')) {
      closeModal();
    }
  });
});
