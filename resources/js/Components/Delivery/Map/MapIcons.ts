import L from "leaflet";

export const createStoreIcon = (): L.DivIcon => {
    return L.divIcon({
        className: "custom-modern-store-pin",
        html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                <div style="background:#14433D;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 16px rgba(20,67,61,0.4);">
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

export const createStopIcon = (
    stopNumber: number,
    isDelivered: boolean,
    isSelected: boolean = false
): L.DivIcon => {
    const bgColor = isDelivered ? "#10B981" : isSelected ? "#0284C7" : "#ED7218";
    const shadowColor = isDelivered
        ? "rgba(16,185,129,0.4)"
        : isSelected
        ? "rgba(2,132,199,0.5)"
        : "rgba(237,114,24,0.4)";
    const innerContent = isDelivered
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<span style="font-weight:900;font-size:14px;color:#ffffff;line-height:1;">${stopNumber}</span>`;

    return L.divIcon({
        className: `custom-modern-stop-pin-${stopNumber}`,
        html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                ${
                    isSelected
                        ? '<div style="position:absolute;inset:0;background:#0284C7;border-radius:50%;opacity:0.3;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>'
                        : ""
                }
                <div style="background:${bgColor};width:${isSelected ? 36 : 34}px;height:${
            isSelected ? 36 : 34
        }px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:${
            isSelected ? "3px" : "2.5px"
        } solid #ffffff;box-shadow:0 6px 16px ${shadowColor};z-index:2;">
                    ${innerContent}
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

export const createDriverIcon = (): L.DivIcon => {
    return L.divIcon({
        className: "custom-modern-driver-pin",
        html: `
            <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;inset:0;background:#006591;border-radius:50%;opacity:0.25;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="background:#006591;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 18px rgba(0,101,145,0.45);z-index:2;">
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
