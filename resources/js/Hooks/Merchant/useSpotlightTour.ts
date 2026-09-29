import { useState, useEffect, useRef, useCallback } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";
import { TourStepItem, SpotlightRect } from "@/types/tour";

interface UseSpotlightTourOptions {
    steps: TourStepItem[];
    onClose?: () => void;
    markCompletedOnServer?: boolean;
}

export function useSpotlightTour({
    steps,
    onClose,
    markCompletedOnServer = false,
}: UseSpotlightTourOptions) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    const [dialogStyle, setDialogStyle] = useState<React.CSSProperties>({});
    const [arrowPlacement, setArrowPlacement] = useState<
        "top" | "bottom" | "left" | "right" | "none"
    >("none");
    const dialogRef = useRef<HTMLDivElement>(null);

    const currentData = steps[currentStep] || steps[0];
    const isLastStep = currentStep === steps.length - 1;

    // Kalkulasi posisi non-overlapping secara dinamis
    const updatePositions = useCallback(() => {
        if (!currentData) return;
        const targetEl = document.getElementById(currentData.targetId);

        if (!targetEl) {
            setSpotlightRect(null);
            setDialogStyle({
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            });
            setArrowPlacement("none");
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        const padding = 10;

        const spotTop = Math.max(8, rect.top - padding);
        const spotLeft = Math.max(8, rect.left - padding);
        const spotWidth = Math.min(window.innerWidth - spotLeft - 8, rect.width + padding * 2);
        const spotHeight = rect.height + padding * 2;
        const spotBottom = spotTop + spotHeight;
        const spotRight = spotLeft + spotWidth;

        setSpotlightRect({
            top: spotTop,
            left: spotLeft,
            width: spotWidth,
            height: spotHeight,
        });

        const isMobile = window.innerWidth < 768;
        const dialogWidth = Math.min(window.innerWidth - 32, 450);
        const dialogHeight = dialogRef.current ? dialogRef.current.offsetHeight : 310;

        if (isMobile) {
            if (spotTop > dialogHeight + 20) {
                setDialogStyle({
                    position: "fixed",
                    top: "12px",
                    left: "16px",
                    right: "16px",
                    width: "auto",
                    maxHeight: `${Math.max(220, spotTop - 20)}px`,
                });
                setArrowPlacement("bottom");
            } else {
                setDialogStyle({
                    position: "fixed",
                    bottom: "12px",
                    left: "16px",
                    right: "16px",
                    width: "auto",
                    maxHeight: `${Math.max(220, window.innerHeight - spotBottom - 20)}px`,
                });
                setArrowPlacement("top");
            }
            return;
        }

        // Desktop calculations
        const spaceBelow = window.innerHeight - spotBottom - 16;
        const spaceAbove = spotTop - 16;
        const spaceRight = window.innerWidth - spotRight - 16;
        const spaceLeft = spotLeft - 16;

        let posX = Math.max(16, spotLeft + spotWidth / 2 - dialogWidth / 2);
        if (posX + dialogWidth > window.innerWidth - 16) {
            posX = window.innerWidth - dialogWidth - 16;
        }

        const placement = currentData.preferredPlacement;

        // 1. Coba placement pilihan dulu jika muat tanpa tumpang tindih
        if (placement === "right" && spaceRight >= dialogWidth + 12) {
            const posY = Math.max(
                16,
                Math.min(window.innerHeight - dialogHeight - 16, spotTop + spotHeight / 2 - dialogHeight / 2)
            );
            setDialogStyle({
                position: "fixed",
                top: `${posY}px`,
                left: `${spotRight + 14}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("left");
            return;
        }

        if (placement === "left" && spaceLeft >= dialogWidth + 12) {
            const posY = Math.max(
                16,
                Math.min(window.innerHeight - dialogHeight - 16, spotTop + spotHeight / 2 - dialogHeight / 2)
            );
            setDialogStyle({
                position: "fixed",
                top: `${posY}px`,
                left: `${spotLeft - dialogWidth - 14}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("right");
            return;
        }

        if (placement === "below" && spaceBelow >= dialogHeight + 10) {
            setDialogStyle({
                position: "fixed",
                top: `${spotBottom + 12}px`,
                left: `${posX}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("top");
            return;
        }

        if (placement === "above" && spaceAbove >= dialogHeight + 10) {
            setDialogStyle({
                position: "fixed",
                bottom: `${window.innerHeight - spotTop + 12}px`,
                left: `${posX}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("bottom");
            return;
        }

        // 2. Fallback sisi terbaik
        if (spaceBelow >= dialogHeight + 10) {
            setDialogStyle({
                position: "fixed",
                top: `${spotBottom + 12}px`,
                left: `${posX}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("top");
        } else if (spaceAbove >= dialogHeight + 10) {
            setDialogStyle({
                position: "fixed",
                bottom: `${window.innerHeight - spotTop + 12}px`,
                left: `${posX}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("bottom");
        } else if (spaceRight >= dialogWidth + 12) {
            const posY = Math.max(16, Math.min(window.innerHeight - dialogHeight - 16, spotTop));
            setDialogStyle({
                position: "fixed",
                top: `${posY}px`,
                left: `${spotRight + 14}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("left");
        } else if (spaceLeft >= dialogWidth + 12) {
            const posY = Math.max(16, Math.min(window.innerHeight - dialogHeight - 16, spotTop));
            setDialogStyle({
                position: "fixed",
                top: `${posY}px`,
                left: `${spotLeft - dialogWidth - 14}px`,
                width: `${dialogWidth}px`,
            });
            setArrowPlacement("right");
        } else {
            if (spaceBelow >= spaceAbove) {
                setDialogStyle({
                    position: "fixed",
                    top: `${spotBottom + 8}px`,
                    left: `${posX}px`,
                    width: `${dialogWidth}px`,
                    maxHeight: `${Math.max(200, spaceBelow)}px`,
                });
                setArrowPlacement("top");
            } else {
                setDialogStyle({
                    position: "fixed",
                    bottom: `${window.innerHeight - spotTop + 8}px`,
                    left: `${posX}px`,
                    width: `${dialogWidth}px`,
                    maxHeight: `${Math.max(200, spaceAbove)}px`,
                });
                setArrowPlacement("bottom");
            }
        }
    }, [currentData]);

    // Scroll elemen target saat step berubah
    useEffect(() => {
        if (!currentData) return;
        const targetEl = document.getElementById(currentData.targetId);
        if (targetEl) {
            targetEl.scrollIntoView({
                behavior: "smooth",
                block: currentData.scrollBlock,
            });
        }

        const timer1 = setTimeout(updatePositions, 100);
        const timer2 = setTimeout(updatePositions, 350);

        window.addEventListener("resize", updatePositions);
        window.addEventListener("scroll", updatePositions, true);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener("resize", updatePositions);
            window.removeEventListener("scroll", updatePositions, true);
        };
    }, [currentStep, currentData, updatePositions]);

    // Navigasi keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                if (currentStep < steps.length - 1) {
                    setCurrentStep((prev) => prev + 1);
                }
            } else if (e.key === "ArrowLeft") {
                if (currentStep > 0) {
                    setCurrentStep((prev) => prev - 1);
                }
            } else if (e.key === "Escape") {
                handleCompleteTour(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStep, steps.length]);

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const handleCompleteTour = async (redirectToSettings: boolean = false) => {
        try {
            setIsSubmitting(true);
            if (markCompletedOnServer || redirectToSettings) {
                await axios.post(route("merchant.tour.complete"));
            }

            if (redirectToSettings) {
                toast.success("Misi selesai! Silakan lengkapi alamat toko Anda.", {
                    duration: 4000,
                });
                router.visit(route("merchant.settings.index"));
            } else {
                toast.success("Panduan tutorial berhasil diselesaikan!", {
                    duration: 3000,
                });
                if (onClose) onClose();
            }
        } catch (error) {
            console.error("Gagal menyimpan status tour:", error);
            if (redirectToSettings) {
                router.visit(route("merchant.settings.index"));
            } else if (onClose) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        currentStep,
        setCurrentStep,
        currentData,
        isLastStep,
        isSubmitting,
        spotlightRect,
        dialogStyle,
        arrowPlacement,
        dialogRef,
        handleNext,
        handlePrev,
        handleCompleteTour,
    };
}
