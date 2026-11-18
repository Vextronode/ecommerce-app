import React from "react";
import { Head, usePage } from "@inertiajs/react";

interface SEOHeadProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: "website" | "product" | "article" | "profile";
    canonical?: string;
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function SEOHead({
    title,
    description = "Platform e-commerce resmi Desa Cibenda, Parigi, Pangandaran. Belanja produk UMKM lokal, oleh-oleh khas pesisir, dan kuliner desa terverifikasi langsung dari pedagang.",
    keywords,
    image = "/favicon.png",
    url,
    type = "website",
    canonical,
    jsonLd,
}: SEOHeadProps) {
    const { url: pageUrl } = usePage();

    // Resolve absolute URL
    const getAbsoluteUrl = (pathOrUrl: string) => {
        if (!pathOrUrl) return "";
        if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
            return pathOrUrl;
        }
        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
        }
        return pathOrUrl;
    };

    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : getAbsoluteUrl(pageUrl));
    const absoluteImage = getAbsoluteUrl(image);
    const canonicalUrl = canonical || currentUrl;

    const fullTitle = title.includes("Cibenda Mart") || title.includes("CibendaMart")
        ? title
        : `${title} - Cibenda Mart`;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} head-key="description" />
            {keywords && <meta name="keywords" content={keywords} head-key="keywords" />}
            <link rel="canonical" href={canonicalUrl} head-key="canonical" />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:site_name" content="CibendaMart" head-key="og:site_name" />
            <meta property="og:type" content={type} head-key="og:type" />
            <meta property="og:title" content={fullTitle} head-key="og:title" />
            <meta property="og:description" content={description} head-key="og:description" />
            <meta property="og:url" content={canonicalUrl} head-key="og:url" />
            {absoluteImage && <meta property="og:image" content={absoluteImage} head-key="og:image" />}
            <meta property="og:locale" content="id_ID" head-key="og:locale" />

            {/* Twitter Card */}
            <meta
                name="twitter:card"
                content={absoluteImage ? "summary_large_image" : "summary"}
                head-key="twitter:card"
            />
            <meta name="twitter:title" content={fullTitle} head-key="twitter:title" />
            <meta name="twitter:description" content={description} head-key="twitter:description" />
            {absoluteImage && <meta name="twitter:image" content={absoluteImage} head-key="twitter:image" />}

            {/* Schema.org Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Head>
    );
}
