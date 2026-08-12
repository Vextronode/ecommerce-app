import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const storeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const buyerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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

            L.marker(storePos, { icon: storeIcon })
                .bindPopup(`<strong>${order.store_name}</strong><br/>Lokasi Toko`)
                .addTo(map);

            L.marker(buyerPos, { icon: buyerIcon })
                .bindPopup(`<strong>${order.customer_name}</strong><br/>Lokasi Pengiriman`)
                .addTo(map);

            L.polyline([storePos, buyerPos], { color: "#ED7218", dashArray: "5, 10" }).addTo(map);

            const bounds = L.latLngBounds([storePos, buyerPos]);
            map.fitBounds(bounds, { padding: [30, 30] });

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
                driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon })
                    .bindPopup('<strong>Kurir</strong><br/>Lokasi Saat Ini')
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
        <>
            {storePos && buyerPos ? (
                <div className="relative h-[40vh] w-full bg-slate-200 z-0">
                    <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[400] pointer-events-none">
                        <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="pointer-events-auto bg-[#ED7218] text-white px-5 py-2.5 rounded-full shadow-lg shadow-[#ED7218]/30 font-bold text-sm flex items-center gap-2 hover:bg-[#d66311] transition-colors"
                        >
                            <Navigation className="w-4 h-4" /> Buka Navigasi Google Maps
                        </a>
                    </div>
                </div>
            ) : (
                <div className="h-[30vh] bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
                    Koordinat lokasi tidak lengkap.
                </div>
            )}
        </>
    );
}
