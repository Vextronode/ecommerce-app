import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Custom Modern SVG Icons for Live Map
const createModernStoreIcon = () => {
    return L.divIcon({
        className: 'custom-modern-store-pin',
        html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                <div style="background:#14433D;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 16px rgba(20,67,61,0.35);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                        <path d="M2 7h20"/>
                        <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
    });
};

const createModernBuyerIcon = () => {
    return L.divIcon({
        className: 'custom-modern-buyer-pin',
        html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                <div style="background:#ED7218;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 16px rgba(237,114,24,0.4);">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
    });
};

export const createModernDriverIcon = () => {
    return L.divIcon({
        className: 'custom-modern-driver-pin',
        html: `
            <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;inset:0;background:#10B981;border-radius:50%;opacity:0.25;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="background:#059669;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 18px rgba(5,150,105,0.45);z-index:2;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18.5" cy="17.5" r="3.5"/>
                        <circle cx="5.5" cy="17.5" r="3.5"/>
                        <circle cx="15" cy="5" r="1"/>
                        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24],
    });
};

interface DeliveryMapProps {
    storePos: [number, number] | null;
    buyerPos: [number, number] | null;
    driverPos: [number, number] | null;
    order: any;
}

export default function DeliveryMap({ storePos, buyerPos, driverPos, order }: DeliveryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!storePos || !buyerPos || !mapRef.current || order.status === 'delivered') return;

        if (!mapInstance.current) {
            const map = L.map(mapRef.current, { zoomControl: false }).setView(storePos, 13);
            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png").addTo(map);

            L.marker(storePos, { icon: createModernStoreIcon() })
                .bindPopup(`<strong>${order.store_name}</strong><br/>Lokasi Toko`)
                .addTo(map);

            L.marker(buyerPos, { icon: createModernBuyerIcon() })
                .bindPopup(`<strong>${order.customer_name}</strong><br/>Lokasi Pengiriman`)
                .addTo(map);

            L.polyline([storePos, buyerPos], { color: "#ED7218", weight: 3, dashArray: "6, 10" }).addTo(map);

            const bounds = L.latLngBounds([storePos, buyerPos]);
            map.fitBounds(bounds, { padding: [40, 40] });

            mapInstance.current = map;
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [storePos, buyerPos, order.status, order.store_name, order.customer_name]);

    useEffect(() => {
        if (driverPos && mapInstance.current) {
            if (!driverMarkerRef.current) {
                driverMarkerRef.current = L.marker(driverPos, { icon: createModernDriverIcon() })
                    .bindPopup('<strong>Kurir CiMart</strong><br/>Live Posisi GPS')
                    .addTo(mapInstance.current);
            } else {
                driverMarkerRef.current.setLatLng(driverPos);
            }
        }
    }, [driverPos]);

    const googleMapsUrl = (storePos && buyerPos)
        ? `https://www.google.com/maps/dir/?api=1&origin=${storePos[0]},${storePos[1]}&destination=${buyerPos[0]},${buyerPos[1]}`
        : '#';

    return (
        <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-6 bg-gray-100">
            <div ref={mapRef} className="w-full h-full z-0" />
            
            <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-[400] bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-gray-50 flex items-center gap-2 border border-gray-100 transition-all hover:scale-105 active:scale-95"
            >
                <Navigation className="w-4 h-4 text-[#ED7218]" />
                Petunjuk Arah
            </a>
        </div>
    );
}
