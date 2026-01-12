# CollabNote JS

A **real-time collaborative notebook and drawing application** for web and mobile.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Start Backend Server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Start Web App

```bash
cd web
npm install
npm run dev
```

Web app runs on `http://localhost:5173`

### 3. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

> **Note:** Update `API_URL` in `/mobile/src/services/api.js` and `/mobile/src/sockets/socketClient.js` with your computer's IP address.

## 🏗️ Project Structure

```
/draw
├── /server          # Node.js + Express + Socket.IO backend
├── /web             # React (Vite) web application
└── /mobile          # React Native (Expo) mobile app
```

## ✨ Features

- **User Authentication** - Register/Login with JWT
- **Notebooks** - Create, share, and manage collaborative notebooks
- **Rich Text Editor** - Bold, headings, lists formatting
- **Drawing Canvas** - Freehand drawing with color picker and eraser
- **Real-Time Sync** - Instant updates across all connected clients
- **User Presence** - See who's online in your notebook

## 🔧 Environment Variables

Create `/server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabnote
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## 📱 Mobile Configuration

For mobile app to connect to your local server:

1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update IP in:
   - `/mobile/src/services/api.js`
   - `/mobile/src/sockets/socketClient.js`

## 🧪 Testing

1. Open web app in two browser tabs
2. Login with same or different accounts
3. Open the same notebook
4. Type or draw - changes sync instantly!
