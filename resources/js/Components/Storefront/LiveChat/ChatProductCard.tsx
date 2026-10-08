import React from "react";
import { ProductAttachment } from "@/types/chat";
import { ShoppingBag, ExternalLink } from "lucide-react";

interface Props {
    product: ProductAttachment;
}

export default function ChatProductCard({ product }: Props) {
    return (
        <div className="mb-1.5 max-w-[280px] bg-white rounded-2xl border border-orange-200/80 shadow-xs overflow-hidden">
            <div className="px-3 py-1.5 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-orange" />
                    Kamu menanyakan produk ini
                </span>
            </div>
            <a
                href={`/product/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50/80 transition-colors group"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {product.image_path ? (
                        <img
                            src={product.image_path}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ShoppingBag className="w-5 h-5 m-auto text-gray-400" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-brand-orange transition-colors">
                        {product.name}
                    </p>
                    <p className="text-xs font-bold text-brand-orange mt-0.5">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-orange shrink-0 mr-0.5 transition-colors" />
            </a>
        </div>
    );
}
