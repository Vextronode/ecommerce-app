import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";
import { useAddressSearch } from "@/Hooks/useAddressSearch";
import { useAddressMap } from "@/Hooks/useAddressMap";

interface UseAddressModalFormOptions {
    isOpen: boolean;
    onClose: () => void;
    addressToEdit?: any;
    storeRoute: string;
    updateRoute: (id: number | string) => string;
}

export function useAddressModalForm({
    isOpen,
    onClose,
    addressToEdit,
    storeRoute,
    updateRoute,
}: UseAddressModalFormOptions) {
    const { data, setData, post, put, processing, reset, transform } = useForm({
        recipient_name: "",
        phone: "",
        provinsi: "",
        jalan: "",
        detail: "",
        label: "Rumah",
        is_primary: false,
        full_address: "",
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const search = useAddressSearch(setData, data.provinsi);

    const handleCoordsChange = async (lat: number, lng: number) => {
        try {
            const baseUrl = import.meta.env.VITE_NOMINATIM_URL;
            const response = await fetch(
                `${baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            );
            if (!response.ok) {
                throw new Error("Failed to fetch address");
            }
            const result = await response.json();
            if (result.address) {
                const parsed = search.parseAddressResult(result.address);
                
                // Fallback to the first part of display_name if road is empty
                let streetName = parsed.jalan;
                if (!streetName && result.display_name) {
                    streetName = result.display_name.split(',')[0];
                }

                setData((prev) => ({
                    ...prev,
                    provinsi: parsed.provinsi,
                    jalan: streetName || prev.jalan,
                    latitude: lat,
                    longitude: lng,
                }));
            }
        } catch (error) {
            console.error("Geocoding reverse lookup error:", error);
        }
    };

    const map = useAddressMap(
        isOpen, 
        handleCoordsChange,
        addressToEdit?.latitude,
        addressToEdit?.longitude
    );

    useEffect(() => {
        if (isOpen && addressToEdit) {
            const parts = addressToEdit.full_address.split(", ");
            const prov = parts.length > 2 ? parts.pop() : "";
            const det = parts.length > 1 ? parts.pop() : "";
            const jal = parts.join(", ");
            const cleanPhone = addressToEdit.phone.startsWith("+62")
                ? addressToEdit.phone.slice(3)
                : addressToEdit.phone;

            setData({
                recipient_name: addressToEdit.recipient_name,
                phone: cleanPhone,
                provinsi: prov || addressToEdit.full_address,
                jalan: jal || addressToEdit.full_address,
                detail: det || "",
                label: addressToEdit.label,
                is_primary: addressToEdit.is_primary,
                full_address: addressToEdit.full_address,
                latitude: addressToEdit.latitude,
                longitude: addressToEdit.longitude,
            });
        } else if (!isOpen) {
            reset();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, addressToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.latitude === null || data.longitude === null) {
            toast.error("Silakan tentukan titik lokasi pada peta di bawah agar fitur pengiriman berfungsi dengan baik.");
            return;
        }
        const separatorDetail = data.detail ? `, ${data.detail}` : "";
        const payload = {
            ...data,
            full_address: `${data.jalan}${separatorDetail}, ${data.provinsi}`,
            phone: data.phone.startsWith("0")
                ? data.phone
                : `+62${data.phone}`,
        };
        transform(() => payload);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    addressToEdit
                        ? "Alamat berhasil diperbarui!"
                        : "Alamat baru berhasil ditambahkan!",
                );
                reset();
                onClose();
            },
            onError: () => {
                toast.error("Gagal menyimpan alamat. Periksa data kembali.");
            },
        };

        if (addressToEdit) {
            put(updateRoute(addressToEdit.id), options);
        } else {
            post(storeRoute, options);
        }
    };

    return {
        data,
        setData,
        processing,
        search,
        map,
        handleSubmit,
    };
}
