// Step 1 JavaScript - User ID and Game ID Form
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('step1Form');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Generate a unique session ID
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
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
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value.trim();
        const gameId = document.getElementById('gameId').value.trim();
        
        // Validate inputs
        if (!validateForm()) {
            return;
        }
        
        // Show loading
        showLoading();
        
        try {
            const response = await fetch('/api/step1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    gameId,
                    sessionId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store session ID for step 2
                sessionStorage.setItem('mlSessionId', sessionId);
                
                // Simulate processing time for better UX
                setTimeout(() => {
                    hideLoading();
                    // Redirect to step 2 with smooth transition
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = '/step2';
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
        
        if (input.id === 'userId') {
            if (value.length > 0) {
                if (value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value)) {
                    inputGroup.classList.add('success');
                    return true;
                } else {
                    inputGroup.classList.add('error');
                    return false;
                }
            }
        } else if (input.id === 'gameId') {
            if (value.length > 0) {
                if (value.length >= 4 && /^[0-9]+$/.test(value)) {
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
        const userId = document.getElementById('userId').value.trim();
        const gameId = document.getElementById('gameId').value.trim();
        
        let isValid = true;
        
        if (!userId || userId.length < 3 || !/^[a-zA-Z0-9_]+$/.test(userId)) {
            showFieldError('userId', 'User ID must be at least 3 characters and contain only letters, numbers, and underscores');
            isValid = false;
        }
        
        if (!gameId || gameId.length < 4 || !/^[0-9]+$/.test(gameId)) {
            showFieldError('gameId', 'Game ID must be at least 4 digits and contain only numbers');
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
    
    // Add CSS for validation states
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
    `;
    document.head.appendChild(style);
    
    // Add smooth page transition
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});