import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import toast from "react-hot-toast";

const customMarker = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export function useAddressMap(
    isOpen: boolean,
    onCoordsChange: (lat: number, lng: number) => void,
    initialLat?: number | null,
    initialLng?: number | null
) {
    const [isLocating, setIsLocating] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        if (!mapRef.current) {
            const initialPos: [number, number] = (initialLat && initialLng) 
                ? [initialLat, initialLng] 
                : [-7.6876, 108.6506]; // Pangandaran
            const map = L.map(mapContainerRef.current).setView(initialPos, 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap",
            }).addTo(map);

            const marker = L.marker(initialPos, { icon: customMarker }).addTo(
                map,
            );

            map.on("click", (e) => {
                marker.setLatLng(e.latlng);
                onCoordsChange(e.latlng.lat, e.latlng.lng);
            });

            mapRef.current = map;
            markerRef.current = marker;
            setTimeout(() => map.invalidateSize(), 150);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isOpen]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 16);
                    markerRef.current.setLatLng([lat, lng]);
                }
                onCoordsChange(lat, lng);
                setIsLocating(false);
            },
            () => {
                toast.error("Gagal ambil lokasi, pastikan izin GPS nyala.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return {
        mapContainerRef,
        mapRef,
        markerRef,
        isLocating,
        handleGetLocation,
    };
}
