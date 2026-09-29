import React, { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface Props {
    expiryTime?: string | null;
    onExpire?: () => void;
}

export default function CountdownTimer({ expiryTime, onExpire }: Props) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    }>({
        hours: 0,
        minutes: 30,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        if (!expiryTime) return;

        const target = new Date(expiryTime).getTime();

        const calculateTime = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                });
                if (onExpire) onExpire();
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({
                hours,
                minutes,
                seconds,
                isExpired: false,
            });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiryTime]);

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const formatNumber = (num: number) => num.toString().padStart(2, "0");

    if (timeLeft.isExpired) {
        return (
            <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-600" />
                <div>
                    <h5 className="font-bold text-sm">Waktu Pembayaran Telah Habis</h5>
                    <p className="text-xs text-rose-600 mt-0.5">
                        Pesanan ini telah kedaluwarsa secara otomatis.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-r from-[#F77F00] via-[#F77F00] to-[#E26D00] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left section */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-xs">
                    <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                        Selesaikan Pembayaran Dalam
                    </h3>
                    <p className="text-xs text-white/90 font-medium mt-0.5">
                        Pesanan otomatis dibatalkan jika waktu habis
                    </p>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-2.5 font-sans">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-11 sm:w-14 sm:h-12 bg-white/25 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs backdrop-blur-sm">
                        <span className="font-black text-lg sm:text-xl text-white font-mono">
                            {formatNumber(timeLeft.hours)}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase mt-1 tracking-wider">
                        JAM
                    </span>
                </div>

                <span className="font-black text-white text-lg pb-4">:</span>

                <div className="flex flex-col items-center">
                    <div className="w-12 h-11 sm:w-14 sm:h-12 bg-white/25 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs backdrop-blur-sm">
                        <span className="font-black text-lg sm:text-xl text-white font-mono">
                            {formatNumber(timeLeft.minutes)}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase mt-1 tracking-wider">
                        MENIT
                    </span>
                </div>

                <span className="font-black text-white text-lg pb-4">:</span>

                <div className="flex flex-col items-center">
                    <div className="w-12 h-11 sm:w-14 sm:h-12 bg-white/25 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs backdrop-blur-sm">
                        <span className="font-black text-lg sm:text-xl text-white font-mono">
                            {formatNumber(timeLeft.seconds)}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase mt-1 tracking-wider">
                        DETIK
                    </span>
                </div>
            </div>
        </div>
    );
}
