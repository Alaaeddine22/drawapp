// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAx1KDPsYWHcDbLwUlrvhSWs9jTLnj6Dc4",
    authDomain: "drawapp-f47b4.firebaseapp.com",
    projectId: "drawapp-f47b4",
    storageBucket: "drawapp-f47b4.firebasestorage.app",
    messagingSenderId: "987598496632",
    appId: "1:987598496632:web:16a5fcb9eaa6f76a415e8d",
    measurementId: "G-81G7GD7PSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, sendEmailVerification, sendPasswordResetEmail };
export default app;
