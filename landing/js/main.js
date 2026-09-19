/* ===== MKZORA — Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {
    // ===== MOBILE MENU =====
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    function openMobileMenu() {
        mobileMenu.classList.add('is-open');
        menuBtn.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        menuBtn.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        // Focus first link
        if (menuLinks.length > 0) menuLinks[0].focus();
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuBtn.classList.remove('menu-open');
        document.body.style.overflow = '';
        menuBtn.focus();
    }

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('is-open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close on link click
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && mobileMenu.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });
    }

    // ===== CUSTOM CURSOR =====
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('custom-cursor-follower');
    const interactiveElements = document.querySelectorAll('[data-interactive], a, button, input, textarea');
    const hasFinPointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    
    if (cursor && follower && hasFinPointer) {
        let mouseX = 0;
        let mouseY = 0;
        let followerX = 0;
        let followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        
        function animateFollower() {
            let distX = mouseX - followerX;
            let distY = mouseY - followerY;
            
            followerX += distX * 0.15;
            followerY += distY * 0.15;
            
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            
            requestAnimationFrame(animateFollower);
        }
        
        animateFollower();
        
        // Hover states
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering-link');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering-link');
            });
        });
    }

    // ===== INTERSECTION OBSERVER — Reveal Animations =====
    const revealElements = document.querySelectorAll('.reveal-up');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };
    
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ===== SMOOTH SCROLL for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== WHATSAPP ENQUIRY FORM =====
    const MKZORA_WHATSAPP_NUMBER = '918838935124';

    const enquiryForm = document.getElementById('enquiry-form');
    const enquirySubmitBtn = document.getElementById('enquiry-submit-btn');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const detailsInput = document.getElementById('contact-details');

    if (enquirySubmitBtn && nameInput && emailInput && detailsInput) {

        // Create validation message elements (using textContent, not innerHTML)
        function createValidationMsg(parentEl, id) {
            const msg = document.createElement('span');
            msg.id = id;
            msg.className = 'form-validation-msg';
            msg.textContent = '';
            parentEl.appendChild(msg);
            return msg;
        }

        const nameError = createValidationMsg(nameInput.parentElement, 'name-error');
        const emailError = createValidationMsg(emailInput.parentElement, 'email-error');
        const detailsError = createValidationMsg(detailsInput.parentElement, 'details-error');

        // Create status message element (shown after WhatsApp opens)
        const statusMsg = document.createElement('span');
        statusMsg.className = 'whatsapp-status-msg';
        statusMsg.textContent = '';
        enquirySubmitBtn.parentElement.insertBefore(statusMsg, enquirySubmitBtn.nextSibling);

        // Email validation regex
        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Clear a single field's error state
        function clearFieldError(input, errorEl) {
            input.classList.remove('form-field-error');
            errorEl.classList.remove('is-visible');
            errorEl.textContent = '';
        }

        // Set a single field's error state
        function setFieldError(input, errorEl, message) {
            input.classList.add('form-field-error');
            errorEl.textContent = message;
            errorEl.classList.add('is-visible');
        }

        // Clear errors on input
        nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
        emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
        detailsInput.addEventListener('input', () => clearFieldError(detailsInput, detailsError));

        // Submit handler
        enquirySubmitBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const details = detailsInput.value.trim();
            let isValid = true;

            // Hide status message if visible
            statusMsg.classList.remove('is-visible');

            // Validate Full Name
            if (!name) {
                setFieldError(nameInput, nameError, 'Please enter your full name.');
                isValid = false;
            } else {
                clearFieldError(nameInput, nameError);
            }

            // Validate Email
            if (!email) {
                setFieldError(emailInput, emailError, 'Please enter your email address.');
                isValid = false;
            } else if (!isValidEmail(email)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearFieldError(emailInput, emailError);
            }

            // Validate Project Details
            if (!details) {
                setFieldError(detailsInput, detailsError, 'Please describe your project.');
                isValid = false;
            } else {
                clearFieldError(detailsInput, detailsError);
            }

            if (!isValid) return;

            // Build WhatsApp message
            const message =
                'Hello MKZORA,\n\n' +
                'I would like to discuss a project.\n\n' +
                '*Project Enquiry*\n\n' +
                'Name: ' + name + '\n\n' +
                'Email: ' + email + '\n\n' +
                'Project Details:\n' + details + '\n\n' +
                'I would like to discuss this project further.\n\n' +
                'Thank you.';

            const whatsappURL = 'https://wa.me/' + MKZORA_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

            // Show status
            statusMsg.textContent = 'Opening WhatsApp...';
            statusMsg.classList.add('is-visible');

            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // Fade out status after 3 seconds
            setTimeout(() => {
                statusMsg.classList.remove('is-visible');
            }, 3000);
        });
    }
});
