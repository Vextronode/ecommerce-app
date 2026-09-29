import { Clock, ShieldCheck, Snowflake } from "lucide-react";
import { GuaranteeItem } from "./types";

type ShippingGuaranteeCardProps = {
    items: GuaranteeItem[];
};

const iconMap = {
    snowflake: Snowflake,
    clock: Clock,
    shield: ShieldCheck,
};

export default function ShippingGuaranteeCard({
    items,
}: ShippingGuaranteeCardProps) {
    return (
        <div className="h-fit rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                Shipping & Guarantee
            </h4>

            <div className="space-y-6">
                {items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const toneClasses =
                        item.tone === "blue"
                            ? "bg-brand-blue-tint text-brand-blue"
                            : "bg-green-100 text-green-600";

                    return (
                        <div key={item.title} className="flex gap-3">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClasses}`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-slate-900">
                                    {item.title}
                                </h5>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
