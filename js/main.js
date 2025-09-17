// Inicializar AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Configuración de GSAP
gsap.registerPlugin(ScrollTrigger);

// Animación del título principal
gsap.from('.hero-title', {
    duration: 1.5,
    y: 100,
    opacity: 0,
    ease: 'power4.out'
});

// Efecto parallax en la imagen del hero
gsap.to('.hero-image-wrapper', {
    yPercent: 50,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// Animación de las tarjetas de habilidades
gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            end: 'top center',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.2
    });
});

// Efecto de partículas en Three.js
function initParticles() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const container = document.getElementById('hero-particles');
    
    if (!container) return;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Crear partículas
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 1000;

    for (let i = 0; i < particleCount; i++) {
        vertices.push(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
        color: 0xe63946,
        size: 2,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 1000;

    // Animación
    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.0001;
        particles.rotation.y += 0.0001;
        renderer.render(scene, camera);
    }

    animate();

    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Smooth scroll personalizado
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        gsap.to(window, {
            duration: 1,
            scrollTo: {
                y: target,
                offsetY: 70
            },
            ease: 'power2.inOut'
        });
    });
});

// Efecto hover en las tarjetas de habilidades
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        });
    });
});

// Efecto de revelación en la galería
gsap.utils.toArray('.gallery-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        rotation: 5,
        duration: 0.8,
        delay: i * 0.1
    });
});

// Inicializar efectos
window.addEventListener('load', () => {
    initParticles();
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        return;
    }

    if (currentScroll > lastScroll) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for animation
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Animate sections on scroll
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.5s ease-out';
    observer.observe(section);
});

// Stats counter animation
function animateStats() {
    const stats = document.querySelectorAll('.number');
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            stat.textContent = Math.floor(current);
            if (current >= target) {
                stat.textContent = target + '+';
                clearInterval(timer);
            }
        }, 20);
    });
}

// Initialize stats animation when the about section is visible
const aboutSection = document.querySelector('.about');
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateStats();
        statsObserver.unobserve(aboutSection);
    }
}, observerOptions);

statsObserver.observe(aboutSection);

// Gallery image loading animation
function loadGalleryImages() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.style.opacity = '0';
        img.onload = () => {
            img.style.opacity = '1';
        };
    });
}

window.addEventListener('load', loadGalleryImages);