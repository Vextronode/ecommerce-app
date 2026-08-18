import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDn0sj_M8QkY8a399XJYRAhsSKYc8uF72U",
    authDomain: "cibendamart.firebaseapp.com",
    projectId: "cibendamart",
    storageBucket: "cibendamart.firebasestorage.app",
    messagingSenderId: "584045016651",
    appId: "1:584045016651:web:d9f61f4b892d2c547e7fce",
    measurementId: "G-RQZLTNSK9K",
};

const app = initializeApp(firebaseConfig);

const getMessagingInstance = async () => {
    try {
        const supported = await isSupported();
        if (!supported) return null;
        return getMessaging(app);
    } catch {
        return null;
    }
};

export const requestForToken = async (): Promise<string | null> => {
    try {
        // Guard for browser environment with notification support
        if (typeof window === "undefined" || !("Notification" in window)) {
            return null;
        }

        // Request permission if not yet decided
        if (Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                return null;
            }
        } else if (Notification.permission !== "granted") {
            return null;
        }

        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) return null;

        // Register service worker explicitly to guarantee scope matching
        let swRegistration: ServiceWorkerRegistration | undefined;
        if ("serviceWorker" in navigator) {
            swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
                scope: "/firebase-cloud-messaging-push-scope",
            });
        }

        const currentToken = await getToken(messagingInstance, {
            vapidKey: "BBTHc5XWQ43VPS1V1GW7gb9gGa02JNQBRZwDiC4-9huOdYIhqYm1NzCyW8f9gL4cVZatL-HWRvPrC666Ul0ZGCw",
            serviceWorkerRegistration: swRegistration,
        });

        return currentToken ?? null;
    } catch (err) {
        console.warn("FCM requestForToken info:", err);
        return null;
    }
};

export const onMessageListener = (callback: (payload: any) => void) => {
    let unsubscribe = () => {};

    getMessagingInstance().then((messagingInstance) => {
        if (!messagingInstance) return;
        unsubscribe = onMessage(messagingInstance, (payload) => {
            callback(payload);
        });
    });

    return () => unsubscribe();
};

export default app;
