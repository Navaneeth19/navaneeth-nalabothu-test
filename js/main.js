// ==================== ANIMATIONS ====================
function runIntroAnimation() {
    // Check if GSAP loaded
    if (typeof gsap === 'undefined') {
        console.error("GSAP failed to load. Force opening site.");
        forceOpenSite();
        return;
    }

    const tl = gsap.timeline();

    tl.to(".loader-progress", { width: "100%", duration: 1.5, ease: "power2.inOut" })
      .to(".gavel-icon", { rotation: 45, duration: 0.1, yoyo: true, repeat: 1, ease: "power4.in" }, "-=1.0")
      .call(() => audio.playGavel())
      .to("#loader", { opacity: 0, duration: 0.5, pointerEvents: "none", ease: "power2.inOut" })
      .to(".hero-badge", { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.2")
      .to(".line-1", { y: "0%", duration: 1.2, ease: "power4.out" }, "-=0.5")
      .to(".line-2", { y: "0%", duration: 1.2, ease: "power4.out" }, "-=1.0")
      .to(".subtitle", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.8")
      .to(".cta-group", { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6");
}

function forceOpenSite() {
    const loader = document.getElementById('loader');
    if(loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
    }
    gsap.to(".hero-badge", { opacity: 1, duration: 0.5 });
    gsap.to(".line-1, .line-2", { y: "0%", duration: 0.5 });
    gsap.to(".subtitle, .cta-group", { opacity: 1, y: 0, duration: 0.5 });
}

// ==================== MAIN INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Systems
    const particles = new ParticleSystem();
    
    // Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hoverTargets = document.querySelectorAll('.hover-target');

    document.addEventListener('mousemove', (e) => {
        if(cursorDot && cursorOutline) {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            setTimeout(() => {
                cursorOutline.style.left = e.clientX + 'px';
                cursorOutline.style.top = e.clientY + 'px';
            }, 50);
        }
    });

    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            if(cursorOutline) cursorOutline.classList.add('active');
            audio.playHover();
        });
        target.addEventListener('mouseleave', () => {
            if(cursorOutline) cursorOutline.classList.remove('active');
        });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            audio.playHover();
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            const label = themeBtn.querySelector('.label');
            if(label) label.textContent = next === 'dark' ? 'Dark' : 'Light';
        });
    }

    // Notify Button
    const notifyBtn = document.querySelector('.btn-primary');
    if(notifyBtn) {
        notifyBtn.addEventListener('click', () => {
            audio.playSuccess();
            const originalText = notifyBtn.textContent;
            notifyBtn.textContent = "You're on the list!";
            setTimeout(() => notifyBtn.textContent = originalText, 2000);
        });
    }

    // Initialize Audio on first click
    document.body.addEventListener('click', () => {
        audio.init();
    }, { once: true });

    // Start animations
    setTimeout(() => {
        runIntroAnimation();
    }, 500);

    // SAFETY BREAKER: Force open after 4 seconds no matter what
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && loader.style.opacity !== '0') {
            console.log("⚠️ Safety Timer Triggered: Force opening site");
            forceOpenSite();
        }
    }, 4000);
});
