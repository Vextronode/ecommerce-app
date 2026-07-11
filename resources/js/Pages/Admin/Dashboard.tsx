import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ShieldCheck, Store, Users } from "lucide-react";

export default function Dashboard() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans">
            <Head title="Admin Dashboard" />

            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#41B9C5]">
                            Cibenda Mart
                        </p>
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            Admin Dashboard
                        </h1>
                    </div>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                    >
                        Logout
                    </Link>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <ShieldCheck className="mb-4 h-7 w-7 text-[#245D56]" />
                        <h2 className="text-sm font-bold text-slate-900">
                            Role Guard Aktif
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Halaman ini hanya bisa diakses akun admin.
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <Store className="mb-4 h-7 w-7 text-[#245D56]" />
                        <h2 className="text-sm font-bold text-slate-900">
                            Merchant Review
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Modul verifikasi pedagang bisa disambungkan di sini.
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <Users className="mb-4 h-7 w-7 text-[#245D56]" />
                        <h2 className="text-sm font-bold text-slate-900">
                            User Oversight
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Monitoring user dan transaksi belum diimplementasi.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
