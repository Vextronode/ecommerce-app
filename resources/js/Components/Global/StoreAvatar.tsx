import React from 'react';

interface StoreAvatarProps {
    logoPath?: string | null;
    storeName: string;
    className?: string;
}

export default function StoreAvatar({ logoPath, storeName, className = "w-full h-full rounded-full" }: StoreAvatarProps) {
    // If we have a logo path, then render the image
    if (logoPath) {
        // Handle Google OAuth HTTP URLs correctly, otherwise assume local storage
        const src = logoPath.startsWith('http') ? logoPath : `/storage/${logoPath}`;
        return (
            <img
                src={src}
                alt={storeName}
                className={`${className} object-cover`}
                onError={(e) => {
                    // Fallback to UI Avatars if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // prevent infinite loop
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=e0f7fa&color=004f54`;
                }}
            />
        );
    }

    // Fallback if logoPath is completely null/empty
    const initials = storeName.substring(0, 2).toUpperCase();

    return (
        <div className={`${className} bg-brand-cyan-soft text-brand-teal-deep flex items-center justify-center font-bold tracking-wide shrink-0 border border-brand-cyan/30 shadow-sm`}>
            {initials}
        </div>
    );
}
