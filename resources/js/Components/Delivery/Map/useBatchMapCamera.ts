import { useState, useCallback, useRef } from "react";
import L from "leaflet";
import { GeoLocationItem } from "./osrmRouting";

export type CameraMode = "fit" | "driver" | "free";

interface UseBatchMapCameraProps<T extends GeoLocationItem> {
    mapRef: React.RefObject<L.Map | null>;
    driverPos: [number, number] | null;
    store: {
        latitude: number | null;
        longitude: number | null;
    };
    stops: T[];
}

export function useBatchMapCamera<T extends GeoLocationItem>({
    mapRef,
    driverPos,
    store,
    stops,
}: UseBatchMapCameraProps<T>) {
    const [cameraMode, setCameraMode] = useState<CameraMode>("fit");
    const hasFittedOnceRef = useRef<boolean>(false);

    const fitAllRoutes = useCallback(() => {
        setCameraMode("fit");
        const map = mapRef.current;
        if (!map) return;

        const bounds = L.latLngBounds([]);
        if (driverPos) {
            bounds.extend(driverPos);
        } else if (store.latitude && store.longitude) {
            bounds.extend([Number(store.latitude), Number(store.longitude)]);
        }

        const undelivered = stops.filter(
            (s) => s.status !== "delivered" && s.shipping_latitude && s.shipping_longitude
        );

        if (undelivered.length > 0) {
            undelivered.forEach((s) => {
                if (s.shipping_latitude && s.shipping_longitude) {
                    bounds.extend([Number(s.shipping_latitude), Number(s.shipping_longitude)]);
                }
            });
        }

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15,
                animate: true,
            });
        }
    }, [mapRef, driverPos, store, stops]);

    const focusDriver = useCallback(() => {
        setCameraMode("driver");
        const map = mapRef.current;
        if (!map) return;

        if (driverPos) {
            map.flyTo(driverPos, 16, { animate: true, duration: 0.8 });
        } else if (store.latitude && store.longitude) {
            map.flyTo([Number(store.latitude), Number(store.longitude)], 15, {
                animate: true,
                duration: 0.8,
            });
        }
    }, [mapRef, driverPos, store]);

    const setFreeMode = useCallback(() => {
        setCameraMode("free");
    }, []);

    const invalidateSize = useCallback(() => {
        const map = mapRef.current;
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
                fitAllRoutes();
            }, 250);
        }
    }, [mapRef, fitAllRoutes]);

    return {
        cameraMode,
        setCameraMode,
        fitAllRoutes,
        focusDriver,
        setFreeMode,
        hasFittedOnceRef,
        invalidateSize,
    };
}
