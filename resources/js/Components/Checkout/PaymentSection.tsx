import React from "react";
import { CreditCard, Wallet, Landmark, Banknote } from "lucide-react";

interface Props {
    selected: string;
    onSelect: (val: string) => void;
}

export default function PaymentSection({ selected, onSelect }: Props) {
    const methods = [
        {
            id: "va",
            icon: Landmark,
            title: "Virtual Account",
            desc: "BCA, Mandiri, BNI, BRI",
        },
        {
            id: "cod",
            icon: Banknote,
            title: "Cash on Delivery (COD)",
            desc: "Bayar tunai di tempat saat barang sampai",
        },
        {
            id: "ewallet",
            icon: Wallet,
            title: "E-Wallet",
            desc: "GoPay, OVO, ShopeePay",
        },
        {
            id: "card",
            icon: CreditCard,
            title: "Credit/Debit Card",
            desc: "Visa, Mastercard, JCB",
        },
    ];

    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Method
            </h2>
            <div className="space-y-3">
                {methods.map((pm) => (
                    <div
                        key={pm.id}
                        onClick={() => onSelect(pm.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${selected === pm.id ? "border-[#245D56] bg-[#245D56]/5" : "border-slate-100 hover:border-slate-200"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                <pm.icon className="w-5 h-5 text-[#245D56]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">
                                    {pm.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {pm.desc}
                                </p>
                            </div>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === pm.id ? "border-[#245D56]" : "border-slate-300"}`}
                        >
                            {selected === pm.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#245D56]"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
