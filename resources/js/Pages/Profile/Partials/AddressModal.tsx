import React from "react";
import AddressFields from "./AddressFields";
import AddressSuggestionInput from "./AddressSuggestionInput";
import AddressMapSection from "./AddressMapSection";
import { useAddressModalForm } from "@/Hooks/Storefront/useAddressModalForm";

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    addressToEdit?: any;
    storeRoute?: string;
    updateRoute?: (id: number | string) => string;
}

export default function AddressModal({
    isOpen,
    onClose,
    addressToEdit,
    storeRoute = route("profile.address.store"),
    updateRoute = (id) => route("profile.address.update", id),
}: AddressModalProps) {
    const { data, setData, processing, search, map, handleSubmit } =
        useAddressModalForm({
            isOpen,
            onClose,
            addressToEdit,
            storeRoute,
            updateRoute,
        });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-slate-100">
                    {addressToEdit ? "Ubah Alamat" : "Detail Alamat"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AddressFields data={data} setData={setData} />

                    <AddressSuggestionInput
                        label="Provinsi, Kota, Kecamatan, Kode Pos"
                        value={data.provinsi}
                        placeholder="Provinsi / Kecamatan"
                        suggestions={search.provSuggestions}
                        searchLoading={search.searchLoading}
                        type="input"
                        activeDropdown={search.activeDropdown}
                        dropdownType="provinsi"
                        onChange={(val) => {
                            setData("provinsi", val);
                            search.setProvQuery(val);
                            search.setActiveDropdown("provinsi");
                        }}
                        onSelect={(item) => {
                            const lat = parseFloat(item.lat);
                            const lng = parseFloat(item.lon);
                            if (map.mapRef.current && map.markerRef.current) {
                                map.mapRef.current.setView([lat, lng], 13);
                                map.markerRef.current.setLatLng([lat, lng]);
                            }
                            setData((prev) => ({
                                ...prev,
                                provinsi: search.parseAddressResult(
                                    item.address,
                                ).provinsi,
                                latitude: lat,
                                longitude: lng,
                            }));
                            search.setProvQuery("");
                            search.setActiveDropdown(null);
                        }}
                        setActiveDropdown={search.setActiveDropdown}
                    />

                    <AddressSuggestionInput
                        label="Nama Jalan, Gedung, No. Rumah"
                        value={data.jalan}
                        placeholder="Ketik nama jalan / kampung..."
                        suggestions={search.jalanSuggestions}
                        searchLoading={search.searchLoading}
                        type="textarea"
                        activeDropdown={search.activeDropdown}
                        dropdownType="jalan"
                        onChange={(val) => {
                            setData("jalan", val);
                            search.setJalanQuery(val);
                            search.setActiveDropdown("jalan");
                        }}
                        onSelect={(item) => {
                            const lat = parseFloat(item.lat);
                            const lng = parseFloat(item.lon);
                            if (map.mapRef.current && map.markerRef.current) {
                                map.mapRef.current.setView([lat, lng], 17);
                                map.markerRef.current.setLatLng([lat, lng]);
                            }
                            const parsed = search.parseAddressResult(
                                item.address,
                            );
                            setData((prev) => ({
                                ...prev,
                                provinsi: parsed.provinsi || prev.provinsi,
                                jalan:
                                    item.display_name.split(",")[0] ||
                                    parsed.jalan,
                                latitude: lat,
                                longitude: lng,
                            }));
                            search.setJalanQuery("");
                            search.setActiveDropdown(null);
                        }}
                        setActiveDropdown={search.setActiveDropdown}
                    />

                    <div>
                        <label htmlFor="field_114" className="text-xs font-semibold text-gray-500 mb-1 block">
                            Detail Lainnya (Cth: Blok / Unit., Patokan)
                        </label>
                        <input aria-label="Input field" id="field_114"
                            type="text"
                            value={data.detail}
                            onChange={(e) => setData("detail", e.target.value)}
                            placeholder="Contoh: Samping warung madura, pager hitam"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-[#ED7218] text-sm bg-slate-50/50"
                        />
                    </div>

                    <AddressMapSection
                        mapContainerRef={map.mapContainerRef}
                        isLocating={map.isLocating}
                        onGetLocation={map.handleGetLocation}
                    />

                    <div>
                        <label htmlFor="field_133" className="text-sm font-bold text-gray-700 mb-3 block">
                            Tandai Sebagai:
                        </label>
                        <div className="flex gap-3">
                            {["Rumah", "Kantor"].map((lbl) => (
                                <button
                                    key={lbl}
                                    type="button"
                                    onClick={() => setData("label", lbl)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition ${data.label === lbl ? "border-[#ED7218] text-[#ED7218] bg-[#ED7218]/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer w-fit mt-2">
                        <input id="field_133"
                            type="checkbox"
                            checked={data.is_primary}
                            onChange={(e) =>
                                setData("is_primary", e.target.checked)
                            }
                            className="w-4 h-4 text-[#ED7218] border-slate-300 rounded focus:ring-[#ED7218]"
                        />
                        <span className="text-sm text-slate-600 font-medium">
                            Atur sebagai alamat pribadi
                        </span>
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-slate-300 hover:bg-slate-400 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-[#ED7218] hover:bg-[#d66311] shadow-lg shadow-[#ED7218]/20 transition disabled:opacity-50"
                        >
                            Simpan Alamat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
