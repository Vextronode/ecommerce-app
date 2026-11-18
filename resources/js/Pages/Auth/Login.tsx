// import libraries
import { useEffect, FormEventHandler } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

//import components
import FormInput from "@/Components/FormInput";
import PrimaryButton from "@/Components/PrimaryButton";
import GoogleIcon from "@/Components/Icons/GoogleIcon";
import AuthErrorBanner from "@/Components/AuthErrorBanner";
import AuthMerchantNotice from "@/Components/AuthMerchantNotice";
import AuthLayout from "@/Layouts/AuthLayout";

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        expected_role: "user",
    });

    // error redirect socialite masuk lewat prop halaman, bukan errors useForm
    const { errors: pageErrors } = usePage().props;
    const pageEmailError = pageErrors?.email;
    // banner cuma tampil kalau useForm belum punya error email, biar tidak dobel
    const bannerMessage = errors.email ? undefined : pageEmailError;

    useEffect(() => {
        return () => reset("password");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Login" />

            {/* Back to Home / Storefront */}
            <div className="mb-4">
                <Link
                    href={route("dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors group cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-5 sm:mb-6 tracking-wide shrink-0">
                Login
            </h2>

            <form onSubmit={submit} className="flex flex-col grow h-full">
                <div className="space-y-4 grow">
                    <AuthErrorBanner message={bannerMessage} />
                    <FormInput
                        label="Username/Email"
                        id="email"
                        type="text"
                        value={data.email}
                        placeholder="Masukkan username atau email"
                        onChange={(e) => setData("email", e.target.value)}
                        errorMessage={errors.email}
                        required
                    />
                    <FormInput
                        label="Password"
                        id="password"
                        type="password"
                        value={data.password}
                        placeholder="Masukkan password disini"
                        onChange={(e) => setData("password", e.target.value)}
                        errorMessage={errors.password}
                        required
                    />
                    <div className="pt-2">
                        <PrimaryButton disabled={processing}>
                            {processing ? "Memproses..." : "Masuk"}
                        </PrimaryButton>
                    </div>
                </div>

                <div className="mt-5 text-center text-xs sm:text-sm text-gray-500 shrink-0">
                    don't have an account?{" "}
                    <Link
                        href={route("register")}
                        className="text-brand-blue hover:text-brand-blue-hover transition-colors duration-200 font-semibold"
                    >
                        Sign Up
                    </Link>
                </div>
                
                <div aria-label="Pilih opsi yang tersedia" className="text-center mt-3 shrink-0 flex justify-center">
                    <a aria-label="Tampilkan rincian lebih lanjut"
                        href={route("google.redirect")}
                        className="inline-flex items-center justify-center transition duration-300 hover:scale-110"
                    >
                        <GoogleIcon className="w-16 sm:w-20 h-auto" />
                    </a>
                </div>

                <AuthMerchantNotice />
            </form>
        </>
    );
};

Login.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default Login;
