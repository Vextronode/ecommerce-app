import React from "react";

export type TourPlacement = "below" | "above" | "left" | "right";
export type TourScrollBlock = ScrollLogicalPosition; // "start" | "end" | "center" | "nearest"

export interface TourStepItem {
    stepNumber: number;
    targetId: string;
    preferredPlacement: TourPlacement;
    scrollBlock: TourScrollBlock;
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    description: string;
    bulletPoints: string[];
    tips?: string;
    ctaText?: string;
}

export type MerchantTourTabKey =
    | "dashboard"
    | "products_index"
    | "products_create"
    | "products_edit"
    | "orders"
    | "customers"
    | "analytics"
    | "settings"
    | "withdrawals";

export interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}
