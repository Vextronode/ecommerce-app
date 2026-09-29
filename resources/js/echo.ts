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
const rawHost = import.meta.env.VITE_REVERB_HOST;
const isHttps = (import.meta.env.VITE_REVERB_SCHEME === 'https') || 
    (typeof window !== 'undefined' && window.location.protocol === 'https:');

const reverbHost = rawHost || (typeof window !== 'undefined' ? (isHttps ? 'ws.ryhndastra.site' : window.location.hostname) : 'localhost');
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || (isHttps ? 443 : 8080));

export const echoInstance = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: isHttps ? 443 : reverbPort,
    forceTLS: isHttps,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

if (typeof window !== 'undefined') {
    window.Echo = echoInstance;
}

export default echoInstance;
