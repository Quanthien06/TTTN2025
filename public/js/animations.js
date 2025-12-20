// Advanced Animations
(function() {
    'use strict';

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initialize animations on page load
    function initAnimations() {
        // Add fade-in to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('fade-in-on-scroll');
            fadeInObserver.observe(card);
        });

        // Add stagger animation to product grid
        const productGrid = document.querySelector('.products-grid');
        if (productGrid) {
            const cards = productGrid.querySelectorAll('.product-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.05}s`;
            });
        }
    }

    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add scroll to top button
    function addScrollToTopButton() {
        const button = document.createElement('button');
        button.id = 'scrollToTop';
        button.className = 'scroll-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.setAttribute('aria-label', 'Scroll to top');
        button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, opacity 0.3s ease;
        `;
        
        button.addEventListener('click', scrollToTop);
        document.body.appendChild(button);

        // Show/hide button on scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 300) {
                button.style.display = 'flex';
                if (currentScroll < lastScroll) {
                    button.style.opacity = '1';
                    button.style.transform = 'scale(1)';
                }
            } else {
                button.style.opacity = '0';
                button.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (window.pageYOffset < 300) {
                        button.style.display = 'none';
                    }
                }, 300);
            }
            lastScroll = currentScroll;
        });
    }

    // Export functions
    window.animations = {
        init: initAnimations,
        scrollToTop: scrollToTop
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAnimations();
            addScrollToTopButton();
        });
    } else {
        initAnimations();
        addScrollToTopButton();
    }
})();

