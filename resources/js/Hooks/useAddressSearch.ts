import { useState, useEffect } from "react";

interface SuggestionItem {
    display_name: string;
    lat: string;
    lon: string;
    address: any;
}

// FIX 1: Tambahin parameter currentProvinsi (kasih default string kosong biar aman)
export function useAddressSearch(setData: any, currentProvinsi: string = "") {
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

    // DEBOUNCE PROVINSI
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

    // DEBOUNCE JALAN (FILTER ALA SHOPEE)
    useEffect(() => {
        if (!jalanQuery || jalanQuery.length < 3) {
            setJalanSuggestions([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                // MAGIC: Gabungin jalan yg diketik sama provinsi yg udah dipilih
                const fullQuery = currentProvinsi
                    ? `${jalanQuery}, ${currentProvinsi}`
                    : jalanQuery;

                const response = await fetch(
                    `${baseUrl}/search?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                );
                const results = await response.json();

                // Kalau ketemu hasil spesifik di kota itu, tampilin
                if (results && results.length > 0) {
                    setJalanSuggestions(results);
                } else {
                    // Fallback: Kalau terlalu spesifik dan ga ketemu, cari polos aja
                    const fallbackRes = await fetch(
                        `${baseUrl}/search?format=json&q=${encodeURIComponent(jalanQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                    );
                    setJalanSuggestions(await fallbackRes.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setSearchLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [jalanQuery, currentProvinsi, baseUrl]);

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
