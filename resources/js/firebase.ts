import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDn0sj_M8QkY8a399XJYRAhsSKYc8uF72U",
    authDomain: "cibendamart.firebaseapp.com",
    projectId: "cibendamart",
    storageBucket: "cibendamart.firebasestorage.app",
    messagingSenderId: "584045016651",
    appId: "1:584045016651:web:d9f61f4b892d2c547e7fce",
    measurementId: "G-RQZLTNSK9K"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;
    
    try {
        const currentToken = await getToken(messaging, { 
            vapidKey: "BBTHc5XWQ43VPS1V1GW7gb9gGa02JNQBRZwDiC4-9huOdYIhqYm1NzCyW8f9gL4cVZatL-HWRvPrC666Ul0ZGCw" 
        });
        if (currentToken) {
            return currentToken;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) return () => {}; // return empty unsubscribe function
    
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};

export default app;
