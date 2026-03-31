document.addEventListener('DOMContentLoaded', () => {
    // Initialize Systems
    const particles = new ParticleSystem();
    
    // Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hoverTargets = document.querySelectorAll('.hover-target');

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        // Lag effect for outline
        setTimeout(() => {
            cursorOutline.style.left = e.clientX + 'px';
            cursorOutline.style.top = e.clientY + 'px';
        }, 50);
    });

    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('active');
            audio.playHover();
        });
        target.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('active');
        });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    themeBtn.addEventListener('click', () => {
        audio.playHover();
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeBtn.querySelector('.label').textContent = next === 'dark' ? 'Dark' : 'Light';
    });

    // Notify Button
    document.querySelector('.btn-primary').addEventListener('click', () => {
        audio.playSuccess();
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.textContent = "You're on the list!";
        setTimeout(() => btn.textContent = originalText, 2000);
    });

    // Initialize Audio on first click anywhere
    document.body.addEventListener('click', () => {
        audio.init();
    }, { once: true });

    // Run Animations
    setTimeout(() => {
        runIntroAnimation();
        setupParallax();
    }, 500);
});
