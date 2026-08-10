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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <div className="space-y-5 grow">
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
                    <div className="pt-4">
                        <PrimaryButton disabled={processing}>
                            {processing ? "Memproses..." : "Masuk"}
                        </PrimaryButton>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 shrink-0">
                    don't have an account?{" "}
                    <Link
                        href={route("register")}
                        className="text-[#1ABCFE] hover:text-[#0c9bd3] transition-colors duration-200 font-medium"
                    >
                        Sign Up
                    </Link>
                </div>
                
                <div aria-label="Pilih opsi yang tersedia" className="text-center mt-4 shrink-0 flex justify-center">
                    <a aria-label="Tampilkan rincian lebih lanjut"
                        href={route("google.redirect")}
                        className="inline-flex items-center justify-center transition duration-300 hover:scale-110"
                    >
                        <GoogleIcon className="w-20 h-auto" />
                    </a>
                </div>
            </form>
        </>
    );
};

Login.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default Login;
