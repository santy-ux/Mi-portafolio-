// Variables globales
const texto = "Apasionado por la programación, el aprendizaje constante y el deporte.";
let typingIndex = 0;
let isTyping = false;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollAnimations();
    startTypingAnimation();
    initializeParticleAnimations();
    initializeInterestCards();
    addHoverEffects();
    initializeParallax();
    initializeBackToTop();
    initializeContactForm();
    animateOnLoad();
    initializeLoader();
});

// NAVEGACIÓN - FIJA EN LA IZQUIERDA
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Navegación suave - CORREGIDO
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // console.log('Navegando a:', targetId); // Debug
            
            if (targetSection) {
                smoothScrollTo(targetSection);
                updateActiveLink(this);
            }
        });
    });
    
    // Soporte para CTAs del hero que usan data-section (evita enlaces del menú)
    const ctaButtons = document.querySelectorAll('.hero-ctas [data-section]');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Dejar que el enlace haga el desplazamiento nativo (href="#..." + css scroll-behavior: smooth)
            const id = this.getAttribute('data-section') || (this.getAttribute('href') || '').replace('#','');
            // Sincronizar el activo del menú poco después del clic
            setTimeout(() => {
                const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (navLink) updateActiveLink(navLink);
            }, 80);
        });
    });

    // Actualizar link activo en scroll
    window.addEventListener('scroll', debounce(updateActiveNavLink, 100));

    // Establecer enlace activo inicialmente
    updateActiveNavLink();
}

function updateActiveLink(clickedLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active', 'glow');
    });
    clickedLink.classList.add('active', 'glow');
    setTimeout(() => clickedLink.classList.remove('glow'), 1600);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const scrollY = window.scrollY + 100;
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active', 'glow'));
            const correspondingLink = document.querySelector(`a[href="#${section.id}"]`);
            if (correspondingLink) {
                // Si cambia el activo, activar brillo breve
                if (!correspondingLink.classList.contains('active')) {
                    correspondingLink.classList.add('active', 'glow');
                    setTimeout(() => correspondingLink.classList.remove('glow'), 1600);
                } else {
                    correspondingLink.classList.add('active');
                }
            }
        }
    });
}

function smoothScrollTo(target) {
    // Cálculo estable del destino
  const y = target.getBoundingClientRect().top + window.pageYOffset;

  // Compensar ancho de navbar lateral en móviles si fuese necesario
  const offset = 0;

  // Intenta usar el API nativo
  if (target.scrollIntoView) {
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    } catch (_) { /* sigue con window.scrollTo */ }
  }

  // Fallback
  window.scrollTo({ top: y - offset, behavior: 'smooth' });
}

// Función debounce para mejorar performance
function debounce(func, wait) {
    let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Botón volver arriba
function initializeBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    const toggle = () => {
        if (window.scrollY > 400) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    };

    window.addEventListener('scroll', debounce(toggle, 50));
    toggle();

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Formulario de contacto (mailto con validación básica)
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.querySelector('.form-status');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            if (status) status.textContent = 'Por favor completa todos los campos.';
            return;
        }

        // Validación mínima de email
        const emailOk = /.+@.+\..+/.test(email);
        if (!emailOk) {
            if (status) status.textContent = 'Ingresa un correo válido.';
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando…';
        }
        if (status) status.textContent = 'Enviando tu mensaje…';

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('message', message);
            formData.append('_subject', `Nuevo mensaje desde el portafolio - ${name}`);
            formData.append('_captcha', 'false');

            const response = await fetch('https://formsubmit.co/ajax/elsanty851@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const data = await response.json();
            if (response.ok && (data.success === 'true' || data.success === true)) {
                if (status) status.textContent = 'Mensaje enviado correctamente. ¡Gracias por contactarme!';
                form.reset();
            } else {
                if (status) status.textContent = 'No se pudo enviar el mensaje. Intenta nuevamente más tarde.';
            }
        } catch (err) {
            if (status) status.textContent = 'Ocurrió un error al enviar. Revisa tu conexión e intenta otra vez.';
            console.warn('Error enviando el formulario:', err);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar';
            }
        }
    });
}

// Loader inicial
function initializeLoader() {
    const overlay = document.getElementById('loader');
    if (!overlay) return;
    // Ocultar después de un breve tiempo o cuando se complete la primera animación
    setTimeout(() => {
        overlay.classList.add('hide');
        overlay.setAttribute('aria-hidden', 'true');
    }, 1200);
}

// ANIMACIONES DE SCROLL
function initializeScrollAnimations() {
    const sections = document.querySelectorAll('.section-animated');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Activar animaciones específicas de la sección
                if (entry.target.id === 'habilidades') {
                    animateSkillCards(entry.target);
                } else if (entry.target.id === 'intereses') {
                    animateInterestCards(entry.target);
                } else if (entry.target.id === 'experiencia' || entry.target.id === 'estudios') {
                    animateTimeline(entry.target);
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function animateSkillCards(section) {
    const cards = section.querySelectorAll('.skill-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        }, index * 250);
    });
}

function animateInterestCards(section) {
    const cards = section.querySelectorAll('.interest-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 300);
    });
}

function animateTimeline(section) {
    const items = section.querySelectorAll('.timeline-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// TARJETAS DE INTERESES EXPANDIBLES - CORREGIDO COMPLETAMENTE
function initializeInterestCards() {
    const interestCards = document.querySelectorAll('.interest-card');

    interestCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Cerrar todas las demás tarjetas
            interestCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.classList.remove('expanded');
                }
            });

            // Toggle solo la tarjeta actual
            this.classList.toggle('expanded');
        });

        // Prevenir que el click en la descripción cierre la tarjeta
        const description = card.querySelector('.interest-description');
        if (description) {
            description.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // Al sacar el mouse, cerrar la tarjeta después de un pequeño delay
        card.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!this.matches(':hover')) {
                    this.classList.remove('expanded');
                }
            }, 1000);
        });
    });
}

// ANIMACIÓN DE ESCRITURA (TYPING)
function startTypingAnimation() {
    const typingElement = document.getElementById('typing');
    if (!typingElement) return;
    
    isTyping = true;
    typingIndex = 0;
    typingElement.textContent = '';
    
    function typeCharacter() {
        if (typingIndex < texto.length) {
            typingElement.textContent += texto.charAt(typingIndex);
            typingIndex++;
            setTimeout(typeCharacter, 80);
        } else {
            isTyping = false;
            // Después de terminar, reiniciar después de 3 segundos
            setTimeout(() => {
                if (!isTyping) {
                    startTypingAnimation();
                }
            }, 3000);
        }
    }
    
    typeCharacter();
}

// EFECTOS DE HOVER ADICIONALES
function addHoverEffects() {
    // Efecto de hover para la imagen de perfil
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        profileImg.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.1) saturate(1.2)';
        });
        
        profileImg.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1) saturate(1)';
        });
    }
    
    // Efectos de hover para las tarjetas de habilidades
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// EFECTOS DE PARTÍCULAS
function initializeParticleAnimations() {
    const heroParticles = document.querySelector('.hero-particles');
    if (!heroParticles) return;
    
    // Crear partículas adicionales dinámicamente
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        heroParticles.appendChild(particle);
        
        // Remover la partícula después de la animación
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }
    
    // Crear una nueva partícula cada 2 segundos
    setInterval(createParticle, 2000);
}

// EFECTO PARALLAX SUTIL
function initializeParallax() {
    window.addEventListener('scroll', debounce(function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-particles');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }, 16)); // 60fps
}

// ANIMACIONES AL CARGAR LA PÁGINA
function animateOnLoad() {
    // Animar la navegación al cargar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.opacity = '0';
        navbar.style.transform = 'translateY(-50%) translateX(-100px)';
        
        setTimeout(() => {
            navbar.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            navbar.style.opacity = '1';
            navbar.style.transform = 'translateY(-50%) translateX(0)';
        }, 500);
    }
    
    // Animar elementos del hero
    const heroTitle = document.querySelector('.hero-title');
    const profileImg = document.querySelector('.profile-img');
    
    if (heroTitle) {
        heroTitle.style.transform = 'translateY(50px)';
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
            heroTitle.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            heroTitle.style.transform = 'translateY(0)';
            heroTitle.style.opacity = '1';
        }, 1000);
    }
    
    if (profileImg) {
        profileImg.style.transform = 'scale(0.5)';
        profileImg.style.opacity = '0';
        
        setTimeout(() => {
            profileImg.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            profileImg.style.transform = 'scale(1)';
            profileImg.style.opacity = '1';
        }, 800);
    }
}

// FUNCIÓN PARA REINICIAR ANIMACIONES
function resetAnimations() {
    const animatedElements = document.querySelectorAll('.section-animated');
    animatedElements.forEach(element => {
        element.classList.remove('visible');
    });
    
    // Reiniciar observer
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
}

// MANEJO DE RESIZE DE VENTANA
window.addEventListener('resize', debounce(function() {
    updateActiveNavLink();
}, 250));

// MANEJO DE ERRORES
window.addEventListener('error', function(e) {
    console.warn('Error capturado:', e.error);
});

// FUNCIÓN DE LIMPIEZA AL SALIR DE LA PÁGINA
window.addEventListener('beforeunload', function() {
    isTyping = false;
});

// Función para cerrar todas las tarjetas de intereses cuando se hace clic fuera
document.addEventListener('click', function(e) {
    const interestCards = document.querySelectorAll('.interest-card');
    const clickedInsideCard = e.target.closest('.interest-card');
    
    if (!clickedInsideCard) {
        interestCards.forEach(card => {
            card.classList.remove('expanded');
        });
    }
});