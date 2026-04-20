/* ══════════════════════════════════════
   MAIN — Legal Vanguard
   Heavy Motion · Law Theme · Full Portfolio
══════════════════════════════════════ */

// ── CURSOR ──────────────────────────
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mX = 0, mY = 0, rX = 0, rY = 0;

document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    cursorDot.style.transform = `translate(${mX}px,${mY}px) translate(-50%,-50%)`;
});
(function rafCursor() {
    rX += (mX - rX) * .1;
    rY += (mY - rY) * .1;
    cursorRing.style.transform = `translate(${rX}px,${rY}px) translate(-50%,-50%)`;
    requestAnimationFrame(rafCursor);
})();
document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
document.addEventListener('mouseup',   () => cursorRing.classList.remove('clicking'));

function setCursorHover(els) {
    els.forEach(el => {
        el.addEventListener('mouseenter', () => { cursorRing.classList.add('hovered'); audio.playHover(); });
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
}

// ── MAGNETIC ────────────────────────
function initMagnetic() {
    document.querySelectorAll('.mag-btn').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r  = el.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width  / 2) * .28;
            const dy = (e.clientY - r.top  - r.height / 2) * .28;
            el.style.transform = `translate(${dx}px,${dy}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

// ── SHOCKWAVE ───────────────────────
function fireShockwave(x, y) {
    const sw = document.getElementById('shockwave');
    sw.style.cssText = `left:${x}px;top:${y}px;width:10px;height:10px;opacity:1;transition:none;transform:translate(-50%,-50%) scale(0)`;
    sw.getBoundingClientRect();
    sw.style.transition = 'transform .7s cubic-bezier(.2,.8,.3,1), opacity .7s ease';
    sw.style.transform  = 'translate(-50%,-50%) scale(60)';
    sw.style.opacity    = '0';
    setTimeout(() => { sw.style.cssText = ''; }, 750);
}

// ── GAVEL STRIKE ────────────────────
function gavelStrike() {
    audio.init(); audio.playGavel();
    const icon = document.querySelector('.gavel-icon-wrap');
    if (icon) {
        icon.style.transition = 'transform .08s';
        icon.style.transform  = 'rotate(-40deg) scale(1.3)';
        setTimeout(() => { icon.style.transform = ''; }, 200);
    }
    const btn = document.getElementById('gavel-btn');
    const r   = btn.getBoundingClientRect();
    fireShockwave(r.left + r.width/2, r.top + r.height/2);
    if (typeof bgSystem !== 'undefined') bgSystem.spawnInk(r.left + r.width/2, r.top + r.height/2, true);
    screenShake();
    showStamp();
}

function screenShake() {
    const wrap = document.querySelector('.scroll-wrap');
    let t = 0;
    const shake = () => {
        t++;
        wrap.style.transform = `translate(${(Math.random()-.5)*(10-t)}px,${(Math.random()-.5)*(10-t)}px)`;
        if (t < 8) requestAnimationFrame(shake);
        else wrap.style.transform = '';
    };
    shake();
}

function showStamp() {
    const stamp = document.getElementById('verdict-stamp');
    if (!stamp) return;
    audio.playVerdict();
    gsap.fromTo(stamp,
        { opacity:0, scale:2.5, rotation:-18 },
        { opacity:1, scale:1,   rotation:-18, duration:.25, ease:'power4.out',
          onComplete: () => gsap.to(stamp, { opacity:0, scale:.8, duration:.5, delay:1.2, ease:'power2.in' })
        }
    );
}

// ── SCROLL REVEALS ──────────────────
function initScrollReveals() {
    const wrap = document.getElementById('scroll-wrap');
    if (!wrap) return;

    const items = wrap.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .cred-card, .tl-event');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el    = entry.target;
            const delay = parseFloat(el.dataset.delay || 0);
            setTimeout(() => {
                el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.16,1,.3,1)';
                el.style.opacity    = '1';
                el.style.transform  = 'none';
            }, delay);
            observer.unobserve(el);
        });
    }, { root: wrap, threshold: 0.12 });

    items.forEach(el => {
        // Set initial hidden state for cards/events not already classed
        if (!el.classList.contains('reveal-up') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
            el.style.opacity   = '0';
            el.style.transform = 'translateY(30px)';
        }
        observer.observe(el);
    });
}

// ── TYPEWRITER ──────────────────────
const LEGAL_TEXTS = [
    `"The law is reason,\nfree from passion."\n\n— Aristotle`,
    `"Justice delayed\nis justice denied."\n\n— W.E. Gladstone`,
    `"Injustice anywhere\nis a threat to justice\neverywhere."\n\n— Martin Luther King Jr.`,
    `"The good lawyer\nis not the man who has\nan eye to every side\nof every question;\nhe is the man who\nchooses a side."\n\n— Woodrow Wilson`,
    `"In law, nothing is\ncertain but the expense."\n\n— Samuel Butler`,
    `"The first thing we do,\nlet's kill all the lawyers."\n\n— Shakespeare, Henry VI`,
];

function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    let textIdx = 0, charIdx = 0, deleting = false;
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    el.appendChild(cursor);

    function type() {
        const text = LEGAL_TEXTS[textIdx];
        if (!deleting) {
            charIdx++;
            el.childNodes[0]
                ? (el.childNodes[0].textContent = text.slice(0, charIdx))
                : el.insertBefore(document.createTextNode(text.slice(0, charIdx)), cursor);
            audio.playType();
            if (charIdx >= text.length) { deleting = true; setTimeout(type, 2800); return; }
            setTimeout(type, 45 + Math.random() * 30);
        } else {
            charIdx--;
            if (el.childNodes[0]) el.childNodes[0].textContent = text.slice(0, charIdx);
            if (charIdx <= 0) {
                deleting = false;
                textIdx  = (textIdx + 1) % LEGAL_TEXTS.length;
                setTimeout(type, 400); return;
            }
            setTimeout(type, 18);
        }
    }
    setTimeout(() => { el.insertBefore(document.createTextNode(''), cursor); type(); }, 3200);
}

// ── COUNTDOWN ───────────────────────
function initCountdown() {
    const el = document.getElementById('countdown-val');
    if (!el) return;
    const target = new Date('2025-09-01').getTime();
    function update() {
        const diff = target - Date.now();
        if (diff <= 0) { el.textContent = 'LIVE'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        el.textContent = `${d}D ${h}H ${m}M`;
    }
    update(); setInterval(update, 30000);
}

// ── TILT ────────────────────────────
function initTilt() {
    const hero = document.querySelector('.hero-center');
    if (!hero) return;
    document.addEventListener('mousemove', e => {
        const rx = ((e.clientY / window.innerHeight) - .5) * 5;
        const ry = ((e.clientX / window.innerWidth)  - .5) * -5;
        hero.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
}

// ── SCALES LOADER ───────────────────
function animateScales() {
    if (typeof gsap === 'undefined') return;
    gsap.timeline({ repeat:-1, yoyo:true })
        .to('.scales-pan-l', { attr:{ cy:85 }, duration:1.2, ease:'sine.inOut' })
        .to('.scales-pan-r', { attr:{ cy:65 }, duration:1.2, ease:'sine.inOut' }, '<')
        .to('.scales-beam',  { attr:{ y1:44, y2:36 }, duration:1.2, ease:'sine.inOut' }, '<');
}

// ── INTRO ANIMATION ─────────────────
function runIntro() {
    if (typeof gsap === 'undefined') { forceOpen(); return; }
    const tl = gsap.timeline();
    tl.to('.loader-bar-fill', { width:'100%', duration:1.4, ease:'power2.inOut' })
      .call(() => audio.playGavel())
      .to('.scales-svg', { y:-10, opacity:0, duration:.4, ease:'power2.in' }, '-=.2')
      .to('#loader', { opacity:0, duration:.6, pointerEvents:'none' }, '+=.1')
      .fromTo('.eyebrow', { opacity:0, y:16 }, { opacity:1, y:0, duration:.7, ease:'power3.out' }, '-=.1')
      .fromTo('#name-line-1 .name-char-wrap', { y:'115%', skewX:-8, opacity:0 }, { y:'0%', skewX:0, opacity:1, duration:1.1, ease:'expo.out' }, '-=.3')
      .fromTo('#name-line-2 .name-char-wrap', { y:'115%', skewX:8,  opacity:0 }, { y:'0%', skewX:0, opacity:1, duration:1.1, ease:'expo.out' }, '-=.85')
      .fromTo('.tagline',  { opacity:0, y:20 }, { opacity:1, y:0, duration:.7, ease:'power3.out' }, '-=.5')
      .fromTo('.sub-copy', { opacity:0, y:16 }, { opacity:1, y:0, duration:.7, ease:'power3.out' }, '-=.5')
      .fromTo('.cta-row',  { opacity:0, y:14 }, { opacity:1, y:0, duration:.6, ease:'back.out(1.5)' }, '-=.4')
      .fromTo('.hero-meta',  { opacity:0, x:-20 }, { opacity:1, x:0, duration:.8, ease:'power3.out' }, '-=.6')
      .fromTo('.hero-aside', { opacity:0, x:20  }, { opacity:1, x:0, duration:.8, ease:'power3.out' }, '<')
      .call(() => {
          const r = document.getElementById('name-line-1').getBoundingClientRect();
          if (typeof bgSystem !== 'undefined') bgSystem.spawnInk(r.left + r.width/2, r.top + r.height/2, true);
          // After intro, init scroll reveals
          initScrollReveals();
      }, null, '-=.5');
}

function forceOpen() {
    document.getElementById('loader').style.cssText = 'opacity:0;pointer-events:none';
    document.querySelectorAll('.eyebrow,.tagline,.sub-copy,.cta-row,.hero-meta,.hero-aside')
        .forEach(el => { el.style.opacity='1'; el.style.transform='none'; });
    document.querySelectorAll('.name-char-wrap')
        .forEach(el => { el.style.transform='translateY(0)'; el.style.opacity='1'; });
    initScrollReveals();
}

// ── NOTIFY BUTTONS ──────────────────
function initButtons() {
    function setupNotify(btn) {
        if (!btn) return;
        btn.addEventListener('click', () => {
            audio.playSuccess();
            const label = btn.querySelector('.btn-label');
            label.textContent = "You're on the list ✓";
            btn.style.background = '#2a7a4a';
            btn.style.boxShadow  = '0 0 30px rgba(42,122,74,0.4)';
            setTimeout(() => {
                label.textContent = 'Notify Me at Launch';
                btn.style.background = '';
                btn.style.boxShadow  = '';
            }, 2800);
        });
    }
    setupNotify(document.getElementById('notify-btn'));
    setupNotify(document.getElementById('notify-btn-2'));

    document.getElementById('gavel-btn')?.addEventListener('click', gavelStrike);
}

// ── SMOOTH SCROLL FOR NAV ────────────
function initNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const wrap = document.getElementById('scroll-wrap');
            const top  = target.offsetTop;
            wrap.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// ── INIT ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    animateScales();
    initMagnetic();
    initCountdown();
    initTilt();
    initButtons();
    initNavScroll();
    initTypewriter();

    setCursorHover(document.querySelectorAll(
        '.mag-btn, .btn-gavel, .social-link, .logo-mark, .nav-link, .cred-card, .strip-logo-item, .footer-social'
    ));

    document.body.addEventListener('click',   () => audio.init(), { once: true });
    document.body.addEventListener('keydown', () => audio.init(), { once: true });

    setTimeout(runIntro, 400);
    setTimeout(() => {
        const l = document.getElementById('loader');
        if (l && parseFloat(getComputedStyle(l).opacity) > .1) forceOpen();
    }, 5000);
});
