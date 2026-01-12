// Firebase Authentication Service
import {
    auth,
    sendEmailVerification,
    sendPasswordResetEmail
} from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth';

// Register with Firebase and send verification email
// If email already exists, sign in and resend verification
export const registerWithFirebase = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            // Email exists - try to sign in and resend verification
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user);
            }
            return userCredential.user;
        }
        throw error;
    }
};

// Sign in with Firebase
export const signInWithFirebase = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

// Check if email is verified
export const isEmailVerified = () => {
    return auth.currentUser?.emailVerified || false;
};

// Resend verification email
export const resendVerificationEmail = async () => {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
};

// Send password reset email
export const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

// Update password (for logged in users)
export const updateUserPassword = async (newPassword) => {
    if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
    }
};

// Get current Firebase user
export const getCurrentFirebaseUser = () => {
    return auth.currentUser;
};

// Reload user to get updated emailVerified status
export const reloadUser = async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        return auth.currentUser;
    }
    return null;
};

export { auth };
