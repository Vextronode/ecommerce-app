import React, { useEffect, useRef } from "react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import SEOHead from "@/Components/Global/SEOHead";
import MerchantGuideHero from "@/Components/Storefront/MerchantGuide/MerchantGuideHero";
import MerchantGuideBenefits from "@/Components/Storefront/MerchantGuide/MerchantGuideBenefits";
import MerchantGuideSteps from "@/Components/Storefront/MerchantGuide/MerchantGuideSteps";
import MerchantGuideFaq from "@/Components/Storefront/MerchantGuide/MerchantGuideFaq";
import MerchantGuideCTA from "@/Components/Storefront/MerchantGuide/MerchantGuideCTA";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface MerchantGuideProps {
    sidPortalUrl: string;
}

export default function MerchantGuide({ sidPortalUrl }: MerchantGuideProps) {
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.from(".guide-hero-content", {
                y: 28,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
            });

            gsap.from(".guide-hero-image", {
                scale: 0.96,
                opacity: 0,
                duration: 0.85,
                delay: 0.1,
                ease: "power2.out",
            });
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <StorefrontLayout>
            <SEOHead
                title="Panduan Kemitraan & Pendaftaran Pedagang - CibendaMart"
                description="Panduan resmi cara mendaftar sebagai mitra pedagang di CibendaMart melalui Sistem Informasi Desa (SID) Cibenda. Gratis pendaftaran dan didukung pemerintah desa."
            />

            <div ref={mainRef} className="w-full">
                <MerchantGuideHero sidPortalUrl={sidPortalUrl} />
                <MerchantGuideBenefits />
                <MerchantGuideSteps sidPortalUrl={sidPortalUrl} />
                <MerchantGuideFaq />
                <MerchantGuideCTA sidPortalUrl={sidPortalUrl} />
            </div>
        </StorefrontLayout>
    );
}
