import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    className?: string; // class for the container
    starClassName?: string; // class for individual stars
}

export default function StarRating({ 
    value, 
    onChange, 
    readOnly = false,
    className = "flex gap-1.5",
    starClassName = "w-6 h-6"
}: StarRatingProps) {
    return (
        <div className={className}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    onClick={() => {
                        if (!readOnly && onChange) {
                            onChange(star);
                        }
                    }}
                    className={`
                        ${starClassName} 
                        transition-colors 
                        ${!readOnly ? 'cursor-pointer hover:text-orange-400' : ''}
                        ${value >= star ? 'text-orange-400 fill-orange-400' : 'text-gray-300 stroke-gray-300'}
                    `}
                />
            ))}
        </div>
    );
}
