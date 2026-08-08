import React from "react";

interface Props {
    rank: number;
}

export default function RankBadge({ rank }: Props) {
    if (rank === 1) {
        // Gold Ribbon Icon with Star
        return (
            <div className="flex items-center justify-center" title="Peringkat 1 (Gold)">
                <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Ribbon Banner */}
                    <path
                        d="M6 3H18V19L12 15.5L6 19V3Z"
                        fill="#FBBF24"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    {/* Inner Star */}
                    <path
                        d="M12 7L13.1 9.5H15.8L13.6 11.1L14.4 13.6L12 12L9.6 13.6L10.4 11.1L8.2 9.5H10.9L12 7Z"
                        fill="#FFFFFF"
                    />
                </svg>
            </div>
        );
    }

    if (rank === 2) {
        // Silver Ribbon Icon with Star
        return (
            <div className="flex items-center justify-center" title="Peringkat 2 (Silver)">
                <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Ribbon Banner */}
                    <path
                        d="M6 3H18V19L12 15.5L6 19V3Z"
                        fill="#E2E8F0"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    {/* Inner Star */}
                    <path
                        d="M12 7L13.1 9.5H15.8L13.6 11.1L14.4 13.6L12 12L9.6 13.6L10.4 11.1L8.2 9.5H10.9L12 7Z"
                        fill="#64748B"
                    />
                </svg>
            </div>
        );
    }

    if (rank === 3) {
        // Bronze Ribbon Icon with Star
        return (
            <div className="flex items-center justify-center" title="Peringkat 3 (Bronze)">
                <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Ribbon Banner */}
                    <path
                        d="M6 3H18V19L12 15.5L6 19V3Z"
                        fill="#FDE68A"
                        stroke="#D97706"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    {/* Inner Star */}
                    <path
                        d="M12 7L13.1 9.5H15.8L13.6 11.1L14.4 13.6L12 12L9.6 13.6L10.4 11.1L8.2 9.5H10.9L12 7Z"
                        fill="#B45309"
                    />
                </svg>
            </div>
        );
    }

    // Standard number ranking for Rank 4+
    return (
        <div className="flex items-center justify-center w-6 h-6">
            <span className="font-bold text-gray-700 text-sm">
                {rank}
            </span>
        </div>
    );
}
