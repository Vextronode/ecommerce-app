import React from "react";
import { router } from "@inertiajs/react";
import { TourStepItem, MerchantTourTabKey } from "@/types/tour";
import { merchantTourRegistry } from "@/utils/merchantTourRegistry";
import { useSpotlightTour } from "@/Hooks/Merchant/useSpotlightTour";
import {
    NEXT_TOUR_MAP,
    NextTourDestination,
    markMerchantTabAsViewed,
    markTourFullyCompleted,
    requestTourOnNextPage,
} from "@/utils/merchantTourProgress";
import { SpotlightBeam } from "./SpotlightBeam";
import { TourDialogCard } from "./TourDialogCard";

interface MerchantOnboardingTourProps {
    tabKey?: MerchantTourTabKey;
    merchantName?: string;
    storeName?: string;
    onClose?: () => void;
    markCompletedOnServer?: boolean;
    needsStoreAddress?: boolean;
    customSteps?: TourStepItem[];
}

export const MerchantOnboardingTour: React.FC<MerchantOnboardingTourProps> = ({
    tabKey = "dashboard",
    merchantName,
    storeName,
    onClose,
    markCompletedOnServer = false,
    needsStoreAddress,
    customSteps,
}) => {
    // Ambil langkah dari registry atau customSteps
    const steps: TourStepItem[] = React.useMemo(() => {
        if (customSteps && customSteps.length > 0) {
            return customSteps;
        }
        const registryFn = merchantTourRegistry[tabKey];
        if (registryFn) {
            return registryFn({ merchantName, storeName });
        }
        return [];
    }, [tabKey, merchantName, storeName, customSteps]);

    const nextDestination = NEXT_TOUR_MAP[tabKey] || null;
    const effectiveNeedsStoreAddress = needsStoreAddress ?? markCompletedOnServer;

    const {
        currentStep,
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
    } = useSpotlightTour({
        steps,
        onClose: () => {
            markMerchantTabAsViewed(tabKey);
            if (onClose) onClose();
        },
        markCompletedOnServer,
    });

    const handleGoToNextTab = (destination: NextTourDestination) => {
        markMerchantTabAsViewed(tabKey);
        requestTourOnNextPage(destination.tabKey);
        if (onClose) onClose();
        router.visit(destination.url);
    };

    const handleCloseWithProgress = () => {
        markMerchantTabAsViewed(tabKey);
        if (onClose) onClose();
    };

    if (!currentData || steps.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-fade-in">
            {/* Spotlight Beam Effect */}
            <SpotlightBeam
                spotlightRect={spotlightRect}
                label={currentData.badge || "Fokus Misi"}
            />

            {/* Quest HUD Dialog Card */}
            <TourDialogCard
                stepData={currentData}
                currentStep={currentStep}
                totalSteps={steps.length}
                isLastStep={isLastStep}
                isSubmitting={isSubmitting}
                dialogStyle={dialogStyle}
                arrowPlacement={arrowPlacement}
                dialogRef={dialogRef}
                onNext={handleNext}
                onPrev={handlePrev}
                onClose={handleCloseWithProgress}
                onComplete={(redirect) => {
                    markMerchantTabAsViewed(tabKey);
                    markTourFullyCompleted();
                    handleCompleteTour(redirect);
                }}
                needsStoreAddress={effectiveNeedsStoreAddress}
                nextDestination={nextDestination}
                onGoToNextTab={handleGoToNextTab}
            />
        </div>
    );
};

export default MerchantOnboardingTour;
