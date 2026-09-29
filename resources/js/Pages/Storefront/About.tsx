import React, { useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import AboutHero from "@/Components/Storefront/About/AboutHero";
import AboutStory from "@/Components/Storefront/About/AboutStory";
import AboutValues from "@/Components/Storefront/About/AboutValues";
import AboutPartners from "@/Components/Storefront/About/AboutPartners";
import AboutContactCS from "@/Components/Storefront/About/AboutContactCS";
import AboutCTA from "@/Components/Storefront/About/AboutCTA";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function About() {
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Smooth entrance for Hero content
            gsap.from(".about-hero-content", {
                y: 32,
                opacity: 0,
                duration: 0.85,
                ease: "power2.out",
            });

            gsap.from(".about-hero-image", {
                scale: 0.96,
                opacity: 0,
                duration: 0.9,
                delay: 0.15,
                ease: "power2.out",
            });

            // Smooth hardware-accelerated scroll reveal for each section
            const sections = gsap.utils.toArray<HTMLElement>(".gsap-reveal-section");
            sections.forEach((section) => {
                const items = section.querySelectorAll(".gsap-reveal-item");
                if (items.length > 0) {
                    gsap.from(items, {
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                            toggleActions: "play none none none",
                            once: true,
                        },
                        y: 26,
                        opacity: 0,
                        duration: 0.65,
                        stagger: 0.12,
                        ease: "power2.out",
                    });
                }
            });
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <StorefrontLayout>
            <Head title="Tentang Kami & Kontak CS - Cibenda Mart" />

            <div ref={mainRef} className="w-full">
                {/* Hero Section */}
                <AboutHero />

                {/* Real Coastal Story & Background */}
                <AboutStory />

                {/* 4 Core Pillars of Service */}
                <AboutValues />

                {/* Official Supporting Partners & Institutions */}
                <AboutPartners />

                {/* Dedicated Customer Support & Contact Admin Section */}
                <AboutContactCS />

                {/* Call to Action Footer */}
                <AboutCTA />
            </div>
        </StorefrontLayout>
    );
}
