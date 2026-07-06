import { useState, useEffect } from "react";

interface SuggestionItem {
    display_name: string;
    lat: string;
    lon: string;
    address: any;
}

export function useAddressSearch(setData: any) {
    const [provSuggestions, setProvSuggestions] = useState<SuggestionItem[]>(
        [],
    );
    const [jalanSuggestions, setJalanSuggestions] = useState<SuggestionItem[]>(
        [],
    );
    const [activeDropdown, setActiveDropdown] = useState<
        "provinsi" | "jalan" | null
    >(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [provQuery, setProvQuery] = useState("");
    const [jalanQuery, setJalanQuery] = useState("");

    const baseUrl = import.meta.env.VITE_NOMINATIM_URL;

    const parseAddressResult = (address: any) => {
        const city =
            address.city ||
            address.county ||
            address.town ||
            address.city_district ||
            "";
        const state = address.state || "";
        const postcode = address.postcode || "";
        let road =
            address.road ||
            address.suburb ||
            address.village ||
            address.neighbourhood ||
            address.hamlet ||
            "";
        if (road === "0" || road.toLowerCase() === "undefined") road = "";

        return {
            provinsi: `${state}, ${city}, ${postcode}`
                .replace(/^, |, $/g, "")
                .trim(),
            jalan: road.trim(),
        };
    };

    useEffect(() => {
        if (!provQuery || provQuery.length < 3) {
            setProvSuggestions([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${baseUrl}/search?format=json&q=${encodeURIComponent(provQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                );
                setProvSuggestions(await response.json());
            } catch (error) {
                console.error(error);
            } finally {
                setSearchLoading(false);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [provQuery, baseUrl]);

    useEffect(() => {
        if (!jalanQuery || jalanQuery.length < 3) {
            setJalanSuggestions([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                // Tambahin &accept-language=id
                const response = await fetch(
                    `${baseUrl}/search?format=json&q=${encodeURIComponent(jalanQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                );
                setJalanSuggestions(await response.json());
            } catch (error) {
                console.error(error);
            } finally {
                setSearchLoading(false);
            }
        }, 1500);
    }, [jalanQuery, baseUrl]);

    return {
        provSuggestions,
        setProvSuggestions,
        jalanSuggestions,
        setJalanSuggestions,
        activeDropdown,
        setActiveDropdown,
        searchLoading,
        setProvQuery,
        setJalanQuery,
        parseAddressResult,
    };
}
