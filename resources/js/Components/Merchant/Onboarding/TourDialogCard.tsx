import React from "react";
import {
    Compass,
    X,
    Sparkles,
    CheckCircle2,
    ShieldAlert,
    Lightbulb,
    ArrowLeft,
    ArrowRight,
    MapPin,
    Check,
} from "lucide-react";
import { TourStepItem } from "@/types/tour";

import { NextTourDestination } from "@/utils/merchantTourProgress";

interface TourDialogCardProps {
    stepData: TourStepItem;
    currentStep: number;
    totalSteps: number;
    isLastStep: boolean;
    isSubmitting: boolean;
    dialogStyle: React.CSSProperties;
    arrowPlacement: "top" | "bottom" | "left" | "right" | "none";
    dialogRef: React.RefObject<HTMLDivElement> | React.RefObject<HTMLDivElement | null> | React.Ref<HTMLDivElement>;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    onComplete: (redirectToSettings?: boolean) => void;
    needsStoreAddress?: boolean;
    nextDestination?: NextTourDestination | null;
    onGoToNextTab?: (destination: NextTourDestination) => void;
}

export const TourDialogCard: React.FC<TourDialogCardProps> = ({
    stepData,
    currentStep,
    totalSteps,
    isLastStep,
    isSubmitting,
    dialogStyle,
    arrowPlacement,
    dialogRef,
    onNext,
    onPrev,
    onClose,
    onComplete,
    needsStoreAddress = false,
    nextDestination,
    onGoToNextTab,
}) => {
    return (
        <div
            ref={dialogRef as any}
            style={dialogStyle}
            className="z-50 bg-white rounded-2xl sm:rounded-3xl border-2 border-brand-orange/40 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out max-h-[calc(100vh-28px)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-dialog-title"
        >
            {/* Pointer Arrows */}
            {arrowPlacement === "top" && (
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-orange rotate-45 rounded-xs"
                />
            )}
            {arrowPlacement === "bottom" && (
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-50 border-r-2 border-b-2 border-brand-orange rotate-45 rounded-xs"
                />
            )}
            {arrowPlacement === "left" && (
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-8 -left-2 w-4 h-4 bg-brand-orange rotate-45 rounded-xs"
                />
            )}
            {arrowPlacement === "right" && (
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-8 -right-2 w-4 h-4 bg-brand-orange rotate-45 rounded-xs"
                />
            )}

            {/* Quest Header Bar */}
            <div className="bg-linear-to-r from-brand-orange via-[#FF9F43] to-amber-500 px-4 sm:px-5 py-2.5 text-white flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-xs">
                        <Compass className="w-3.5 h-3.5 text-white animate-spin-slow" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded-full border border-white/30 inline-block leading-none">
                            Tutorial Interaktif
                        </span>
                        <h2 className="text-xs font-black leading-tight drop-shadow-xs">
                            Panduan Fitur Mitra
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Tutup panduan"
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-lg transition cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress HUD */}
            <div className="px-4 sm:px-5 pt-2 pb-1.5 bg-gray-50 border-b border-gray-100 flex flex-col gap-1 shrink-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                    <span className="text-brand-orange flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-orange" />
                        {stepData.badge}
                    </span>
                    <span className="text-gray-500 font-semibold text-[10px]">
                        Langkah {currentStep + 1} dari {totalSteps}
                    </span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-brand-orange to-amber-400 transition-all duration-300 rounded-full"
                        style={{
                            width: `${((currentStep + 1) / totalSteps) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Body Content */}
            <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-2.5">
                {/* Title & Icon */}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint/80 border border-brand-orange/30 flex items-center justify-center shrink-0 shadow-xs">
                        {stepData.icon}
                    </div>
                    <div>
                        <h3
                            id="tour-dialog-title"
                            className="text-sm sm:text-base font-black text-gray-900 leading-snug"
                        >
                            {stepData.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-brand-orange">
                            {stepData.subtitle}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {stepData.description}
                </p>

                {/* Bullet Points */}
                {stepData.bulletPoints && stepData.bulletPoints.length > 0 && (
                    <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                        {stepData.bulletPoints.map((point, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-1.5 text-[11px] text-gray-700"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="font-medium leading-tight">
                                    {point}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notice banner for last step of final tab requiring store address */}
                {isLastStep && !nextDestination && needsStoreAddress ? (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-amber-900">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-tight font-semibold">
                            <span className="font-bold text-amber-950 block mb-0.5">
                                Langkah Terakhir:
                            </span>
                            Rangkaian panduan selesai! Silakan lengkapi alamat fisik toko di Pengaturan untuk mengaktifkan izin upload produk.
                        </div>
                    </div>
                ) : (
                    stepData.tips && (
                        <div className="px-3 py-2 rounded-xl bg-orange-50/70 border border-orange-200/70 text-brand-orange text-[11px] font-medium flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                            <span>{stepData.tips}</span>
                        </div>
                    )
                )}
            </div>

            {/* Footer Controls */}
            <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={currentStep === 0 || isSubmitting}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        currentStep === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
                    }`}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-2">
                    {!isLastStep ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            >
                                Lewati
                            </button>
                            <button
                                type="button"
                                onClick={onNext}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs shadow-md shadow-brand-orange/25 transition cursor-pointer hover:scale-102 active:scale-98"
                            >
                                <span>Lanjut</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                            >
                                Tutup Panduan
                            </button>

                            {nextDestination && onGoToNextTab ? (
                                <button
                                    type="button"
                                    onClick={() => onGoToNextTab(nextDestination)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black text-xs shadow-md shadow-brand-orange/25 transition cursor-pointer hover:scale-102 active:scale-98"
                                >
                                    <span>Lanjut ke Panduan {nextDestination.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onComplete(true)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-brand-orange/30 transition cursor-pointer hover:scale-102 active:scale-98"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Selesaikan & Lengkapi Data ›</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
