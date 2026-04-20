/* ══════════════════════════════════════
   DUAL CANVAS SYSTEM
   canvas-bg  → constellation / scales field
   canvas-ink → ink bleed / ripple effects
══════════════════════════════════════ */

class BackgroundSystem {
    constructor() {
        this.bgCanvas  = document.getElementById('canvas-bg');
        this.inkCanvas = document.getElementById('canvas-ink');
        this.bgCtx     = this.bgCanvas.getContext('2d');
        this.inkCtx    = this.inkCanvas.getContext('2d');

        this.W = 0; this.H = 0;
        this.mouse = { x: -9999, y: -9999 };
        this.nodes = [];
        this.inkDrops = [];
        this.time = 0;
        this.lastFrame = 0;

        this.resize();
        this.buildNodes();
        this.raf(0);

        window.addEventListener('resize', () => {
            clearTimeout(this._rt);
            this._rt = setTimeout(() => { this.resize(); this.buildNodes(); }, 200);
        });
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        [this.bgCanvas, this.inkCanvas].forEach(c => {
            c.width  = this.W;
            c.height = this.H;
        });
    }

    buildNodes() {
        this.nodes = [];
        const count = this.W < 768 ? 35 : 65;
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x:  Math.random() * this.W,
                y:  Math.random() * this.H,
                vx: (Math.random() - .5) * .25,
                vy: (Math.random() - .5) * .25,
                r:  Math.random() * 1.5 + .5,
                phase: Math.random() * Math.PI * 2,
                type: Math.random() < .15 ? 'scale' : 'dot',
            });
        }
    }

    // Public: spawn ink drop at x,y
    spawnInk(x, y, big = false) {
        const count = big ? 12 : 5;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (big ? 4 : 2) + .5;
            this.inkDrops.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r:  Math.random() * (big ? 6 : 3) + 1,
                alpha: big ? .6 : .35,
                life: 1,
                decay: Math.random() * .015 + .008,
            });
        }
    }

    raf(now) {
        requestAnimationFrame(t => this.raf(t));
        if (now - this.lastFrame < 14) return; // ~70fps cap
        this.lastFrame = now;
        this.time += .008;
        this.drawBg();
        this.drawInk();
    }

    drawBg() {
        const { bgCtx: ctx, W, H, nodes, mouse, time } = this;
        ctx.clearRect(0, 0, W, H);

        // Subtle radial glow at mouse
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
        grd.addColorStop(0, 'rgba(201,168,76,0.04)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Update + draw nodes
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -20) n.x = W + 20;
            if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20;
            if (n.y > H + 20) n.y = -20;

            // Mouse repulsion
            const dx = mouse.x - n.x, dy = mouse.y - n.y;
            const dSq = dx*dx + dy*dy;
            if (dSq < 16000) {
                const d = Math.sqrt(dSq);
                n.x -= (dx/d) * (120-d)/120 * 1.2;
                n.y -= (dy/d) * (120-d)/120 * 1.2;
            }

            const pulse = .5 + .5 * Math.sin(time * 1.5 + n.phase);
            const alpha = .08 + pulse * .1;

            if (n.type === 'scale') {
                this.drawScaleIcon(ctx, n.x, n.y, 10 + pulse * 3, alpha);
            } else {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + pulse * .5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201,168,76,${alpha})`;
                ctx.fill();
            }
        }

        // Connection lines
        ctx.lineWidth = .4;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i+1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d  = Math.sqrt(dx*dx + dy*dy);
                if (d < 110) {
                    const a = (1 - d/110) * .06;
                    ctx.strokeStyle = `rgba(201,168,76,${a})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Slow horizontal rule lines (courtroom paper)
        for (let i = 0; i < 3; i++) {
            const y = ((time * 18 + i * (H/3)) % H);
            const a = .025 * Math.sin(time + i);
            ctx.strokeStyle = `rgba(201,168,76,${Math.abs(a)})`;
            ctx.lineWidth = .5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }

    drawScaleIcon(ctx, x, y, size, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = `rgba(201,168,76,${alpha * 1.5})`;
        ctx.lineWidth = .8;
        // beam
        ctx.beginPath(); ctx.moveTo(-size, 0); ctx.lineTo(size, 0); ctx.stroke();
        // pole
        ctx.beginPath(); ctx.moveTo(0, -size*.6); ctx.lineTo(0, 0); ctx.stroke();
        // pans
        ctx.beginPath(); ctx.arc(-size, size*.4, size*.4, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc( size, size*.4, size*.4, 0, Math.PI); ctx.stroke();
        ctx.restore();
    }

    drawInk() {
        const { inkCtx: ctx, W, H } = this;
        // Fade existing ink slowly
        ctx.fillStyle = 'rgba(10,8,4,0.06)';
        ctx.fillRect(0, 0, W, H);

        for (let i = this.inkDrops.length - 1; i >= 0; i--) {
            const d = this.inkDrops[i];
            d.x  += d.vx;
            d.y  += d.vy;
            d.vx *= .94;
            d.vy *= .94;
            d.life -= d.decay;
            if (d.life <= 0) { this.inkDrops.splice(i, 1); continue; }

            const a = d.alpha * d.life;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,168,76,${a})`;
            ctx.fill();
        }
    }
}

// Export global
let bgSystem;
document.addEventListener('DOMContentLoaded', () => {
    bgSystem = new BackgroundSystem();
});
