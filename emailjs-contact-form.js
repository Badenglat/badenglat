// ==========================================
// Contact Form with EmailJS Integration
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;

        // Get form data
        const formData = {
            name: form.querySelector('#name').value.trim(),
            email: form.querySelector('#email').value.trim(),
            subject: form.querySelector('#subject').value.trim(),
            message: form.querySelector('#message').value.trim()
        };

        // Validate form
        const validation = validateForm(formData);

        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Send email using EmailJS
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            to_email: 'badenglat@gmail.com'
        })
            .then(function (response) {
                console.log('Email sent successfully!', response.status, response.text);

                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');

                showNotification('Your message has been sent successfully! I will get back to you soon.', 'success');

                form.reset();

                // Reset field styles
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.style.borderColor = 'var(--border)';
                });

                setTimeout(function () {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.classList.remove('success');
                    submitBtn.disabled = false;
                }, 3000);
            })
            .catch(function (error) {
                console.error('Email sending failed:', error);

                submitBtn.innerHTML = originalBtnText;
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                showNotification('Failed to send message. Please try emailing me directly at badenglat@gmail.com', 'error');
            });
    });

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        // Clear error style on focus
        input.addEventListener('focus', function () {
            if (this.style.borderColor === 'var(--error)') {
                this.style.borderColor = 'var(--primary)';
            }
        });
    });
}
