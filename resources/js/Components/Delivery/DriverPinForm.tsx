import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface DriverPinFormProps {
    invoice_number: string;
}

export default function DriverPinForm({ invoice_number }: DriverPinFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        pin: ''
    });

    const handleComplete = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tracker.complete', invoice_number), {
            onSuccess: () => {
                toast.success('Pengiriman diselesaikan! Saldo telah diteruskan ke toko.');
            },
            onError: (errs) => {
                if (errs.pin) toast.error(errs.pin);
                if (errs.error) toast.error(errs.error);
            }
        });
    };

    return (
        <div className="bg-[#004F54] p-5 rounded-3xl shadow-sm border border-[#004F54] text-white">
            <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-[#41B9C5]" />
                <div>
                    <h3 className="text-sm font-extrabold">Serah Terima Pesanan</h3>
                    <p className="text-[11px] text-[#41B9C5] font-medium">Minta 4-Digit PIN dari HP Pembeli</p>
                </div>
            </div>

            <form onSubmit={handleComplete} className="space-y-4">
                <div>
                    <div aria-label="Pilih opsi yang tersedia" className="flex items-center justify-center gap-2">
                        {[0, 1, 2, 3].map((index) => (
                            <input aria-label="Tampilkan rincian lebih lanjut"
                                key={index}
                                type="text"
                                maxLength={1}
                                className="w-14 h-16 text-center text-2xl font-black rounded-2xl bg-white/10 border border-white/20 text-white focus:bg-white focus:text-[#004F54] focus:ring-0 focus:border-[#41B9C5] transition"
                                value={data.pin[index] || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    let newPin = data.pin.split('');
                                    newPin[index] = val;
                                    setData('pin', newPin.join(''));
                                    
                                    // Auto-focus next
                                    if (val && index < 3) {
                                        const nextInput = document.getElementById(`pin-${index + 1}`);
                                        nextInput?.focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !data.pin[index] && index > 0) {
                                        const prevInput = document.getElementById(`pin-${index - 1}`);
                                        prevInput?.focus();
                                    }
                                }}
                                id={`pin-${index}`}
                            />
                        ))}
                    </div>
                    {errors.pin && <p className="text-xs text-red-400 text-center mt-2 font-medium">{errors.pin}</p>}
                </div>
                <button
                    type="submit"
                    disabled={data.pin.length !== 4 || processing}
                    className="w-full bg-[#41B9C5] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                >
                    Selesaikan Pengiriman
                </button>
            </form>
        </div>
    );
}
