import React from 'react';
import { ShieldCheck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface DriverPinFormProps {
    invoice_number: string;
    is_arrived?: boolean;
}

export default function DriverPinForm({ invoice_number, is_arrived = false }: DriverPinFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        pin: ''
    });
    const [markingArrived, setMarkingArrived] = React.useState(false);

    const handleMarkArrived = () => {
        setMarkingArrived(true);
        router.post(route('tracker.arrive', invoice_number), {}, {
            onSuccess: (page) => {
                const flashErr = (page.props as any)?.flash?.error;
                if (flashErr) {
                    toast.error(flashErr, { id: 'arrive-toast', duration: 5000 });
                } else {
                    toast.success('Konfirmasi tiba di lokasi berhasil! Pembeli telah diberi tahu.', { id: 'arrive-toast' });
                }
                setMarkingArrived(false);
            },
            onError: (errs) => {
                toast.error(errs.error || 'Gagal menandai tiba di lokasi.', { id: 'arrive-toast', duration: 5000 });
                setMarkingArrived(false);
            }
        });
    };

    const handleComplete = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tracker.complete', invoice_number), {
            onSuccess: (page) => {
                const flashErr = (page.props as any)?.flash?.error;
                if (flashErr) {
                    toast.error(flashErr, { id: 'pin-toast', duration: 5000 });
                    setData('pin', '');
                    document.getElementById('pin-0')?.focus();
                    return;
                }
                toast.success('Pengiriman diselesaikan! Saldo telah diteruskan ke toko.', { id: 'pin-toast' });
            },
            onError: (errs) => {
                const message = errs.pin || errs.error || 'PIN tidak sesuai. Silakan coba lagi.';
                toast.error(message, { id: 'pin-toast', duration: 5000 });
                setData('pin', '');
                document.getElementById('pin-0')?.focus();
            }
        });
    };

    return (
        <div className="bg-[#281B7A] p-5 rounded-3xl shadow-sm border border-[#281B7A] text-white space-y-4">
            {/* Arrival Status Banner */}
            {is_arrived ? (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Anda sudah tiba di lokasi pembeli. Silakan minta 4-digit PIN pembeli di bawah.</span>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleMarkArrived}
                    disabled={markingArrived}
                    className="w-full py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-98 transition flex items-center justify-center gap-2 text-xs font-bold text-white border border-white/20 cursor-pointer disabled:opacity-50"
                >
                    <MapPin className="w-4 h-4 text-[#ED7218]" />
                    <span>{markingArrived ? 'Mengonfirmasi...' : 'Saya Sudah Sampai di Lokasi Pembeli'}</span>
                </button>
            )}

            <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#ED7218]" />
                <div>
                    <h3 className="text-sm font-extrabold">Serah Terima Pesanan</h3>
                    <p className="text-[11px] text-[#ED7218] font-medium">Minta 4-Digit PIN dari HP Pembeli</p>
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
                                className="w-14 h-16 text-center text-2xl font-black rounded-2xl bg-white/10 border border-white/20 text-white focus:bg-white focus:text-[#281B7A] focus:ring-0 focus:border-[#ED7218] transition"
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
                    {errors.pin && (
                        <div className="p-3 mt-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs text-center font-medium flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{errors.pin}</span>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={data.pin.length !== 4 || processing}
                    className="w-full bg-[#ED7218] text-white font-bold py-3.5 rounded-xl hover:bg-[#d66311] transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                    {processing ? 'Memproses...' : 'Selesaikan Pengiriman'}
                </button>
            </form>
        </div>
    );
}
