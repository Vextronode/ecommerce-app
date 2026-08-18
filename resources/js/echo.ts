import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: Echo<'reverb'>;
    }
}

window.Pusher = Pusher;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || 'cimart_reverb_key_892147';
const reverbHost = import.meta.env.VITE_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

export const echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort === 8080 ? 8080 : 443,
    forceTLS: reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

if (typeof window !== 'undefined') {
    window.Echo = echoInstance;
}

export default echoInstance;
