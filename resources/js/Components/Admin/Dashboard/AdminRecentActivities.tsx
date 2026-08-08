import React from "react";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";

interface ActivityItem {
    id: number | string;
    time: string;
    title: string;
    description: string;
    dotColor: "teal" | "amber" | "gray" | "red";
}

interface Props {
    activities?: ActivityItem[];
}

export default function AdminRecentActivities({ activities }: Props) {
    const items = activities || [];

    const getDotStyle = (color: ActivityItem["dotColor"]) => {
        switch (color) {
            case "teal":
                return "bg-[#004F54] ring-4 ring-[#E6F7F8]";
            case "amber":
                return "bg-amber-600 ring-4 ring-amber-50";
            case "red":
                return "bg-rose-600 ring-4 ring-rose-50";
            case "gray":
            default:
                return "bg-slate-300 ring-4 ring-slate-100";
        }
    };

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Aktivitas Terbaru
                </h3>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={() => toast("Menampilkan semua riwayat aktivitas...")}
                        className="text-xs font-bold text-[#41B9C5] hover:text-[#004F54] transition-colors cursor-pointer"
                    >
                        View All
                    </button>
                )}
            </div>

            {/* Timeline or Empty State */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-3 shadow-xs">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">
                        Belum Ada Aktivitas
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                        Riwayat aktivitas, transaksi baru, dan pendaftaran mitra akan tercatat secara langsung di sini.
                    </p>
                </div>
            ) : (
                <div className="relative pl-6 space-y-6 flex-1">
                    {/* Vertical Line */}
                    <div className="absolute left-2.5 top-2 bottom-3 w-0.5 bg-gray-100" />

                    {items.map((activity) => (
                        <div key={activity.id} className="relative group">
                            {/* Dot Indicator */}
                            <div
                                className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ${getDotStyle(
                                    activity.dotColor,
                                )} transition-transform group-hover:scale-125`}
                            />

                            {/* Content */}
                            <div>
                                <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">
                                    {activity.time}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#004F54] transition-colors">
                                    {activity.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
