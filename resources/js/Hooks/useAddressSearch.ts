import { useState, useEffect } from "react";

interface SuggestionItem {
    display_name: string;
    lat: string;
    lon: string;
    address: any;
}

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

    const baseUrl =
        import.meta.env.VITE_NOMINATIM_URL ||
        "https://nominatim.openstreetmap.org";

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
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

    // eslint-disable-next-line react-doctor/no-fetch-in-effect
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
                if (!response.ok) throw new Error("Failed");
                setProvSuggestions(await response.json());
            } catch (error) {
                console.error(error);
            } finally {
                setSearchLoading(false);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [provQuery, baseUrl]);

    // eslint-disable-next-line react-doctor/no-fetch-in-effect
    useEffect(() => {
        if (!jalanQuery || jalanQuery.length < 3) {
            setJalanSuggestions([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                const fullQuery = currentProvinsi
                    ? `${jalanQuery}, ${currentProvinsi}`
                    : jalanQuery;

                const response = await fetch(
                    `${baseUrl}/search?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                );
                if (!response.ok) throw new Error("Failed");
                const results = await response.json();

                if (results && results.length > 0) {
                    setJalanSuggestions(results);
                } else {
                    const fallbackRes = await fetch(
                        `${baseUrl}/search?format=json&q=${encodeURIComponent(jalanQuery)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`,
                    );
                    if (!fallbackRes.ok) throw new Error("Failed");
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
