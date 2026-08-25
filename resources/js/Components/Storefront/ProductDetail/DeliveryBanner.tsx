import { Truck } from "lucide-react";

type DeliveryBannerProps = {
    title: string;
    description: string;
};

export default function DeliveryBanner({
    title,
    description,
}: DeliveryBannerProps) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-blue-tint bg-brand-blue-tint/30 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm">
                <Truck className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}
