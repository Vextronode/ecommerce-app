// import libraries
import { useEffect, FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";

//import components
import FormInput from "@/Components/FormInput";
import PrimaryButton from "@/Components/PrimaryButton";
import GoogleIcon from "@/Components/Icons/GoogleIcon";
import AuthLayout from "@/Layouts/AuthLayout";

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        expected_role: "user",
    });

    useEffect(() => {
        return () => reset("password");
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Login" />
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide shrink-0">
                Login
            </h2>

            <form onSubmit={submit} className="flex flex-col grow h-full">
                <div className="space-y-6 grow ">
                    <FormInput
                        label="Username/Email"
                        id="email"
                        type="email"
                        value={data.email}
                        placeholder="Enter your email"
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
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600 mb-3">
                            Use Social Account
                        </p>
                        <a
                            href={route("google.redirect")}
                            className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:shadow-md transition-all duration-300 hover:scale-110"
                        >
                            <GoogleIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="mt-auto pt-6 text-center text-sm text-gray-600 shrink-0">
                    Belum punya akun?{" "}
                    <Link
                        href={route("register")}
                        className="font-bold text-[#1ABCFE] hover:text-[#2563eb] hover:underline transition-colors duration-200"
                    >
                        Daftar sekarang
                    </Link>
                </div>
            </form>
        </>
    );
};

Login.layout = (page: React.ReactNode) => <AuthLayout children={page} />;
export default Login;
