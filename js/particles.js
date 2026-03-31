class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouse = { x: null, y: null };
        
        this.resize();
        this.initParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initParticles() {
        this.particles = [];
        const count = this.width < 768 ? 30 : 80;
        const icons = ['⚖️', '📜', '🔨', '✒️'];
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.width, this.height, icons));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.particles.forEach(p => {
            p.update(this.mouse);
            p.draw(this.ctx, color);
        });

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(w, h, icons) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.icon = icons[Math.floor(Math.random() * icons.length)];
        this.size = Math.random() * 20 + 10;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
    }

    update(mouse) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Mouse repulsion
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                this.x -= dx / 20;
                this.y -= dy / 20;
            }
        }

        // Wrap around
        if (this.x > this.w) this.x = 0;
        if (this.x < 0) this.x = this.w;
        if (this.y > this.h) this.y = 0;
        if (this.y < 0) this.y = this.h;
    }

    draw(ctx, color) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = color;
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.icon, -this.size/2, -this.size/2);
        ctx.restore();
    }
}
