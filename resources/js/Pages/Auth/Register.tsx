// import libraries
import { useEffect, FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";

// import components
import FormInput from "@/Components/FormInput";
import PrimaryButton from "@/Components/PrimaryButton";
import GoogleIcon from "@/Components/Icons/GoogleIcon";
import AuthLayout from "@/Layouts/AuthLayout";

const Register = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => reset("password", "password_confirmation");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setData("password_confirmation", data.password);
        post(route("register"));
    };

    return (
        <>
            <Head title="Register" />

            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide shrink-0">
                Register
            </h2>

            <form onSubmit={submit} className="flex flex-col grow h-full">
                <div className="space-y-4 grow">
                    <FormInput
                        label="Fullname"
                        id="name"
                        type="text"
                        value={data.name}
                        placeholder="Enter your name"
                        onChange={(e) => setData("name", e.target.value)}
                        errorMessage={errors.name}
                        required
                    />
                    <FormInput
                        label="Email Address"
                        id="email"
                        type="email"
                        value={data.email}
                        placeholder="Masukkan email"
                        onChange={(e) => setData("email", e.target.value)}
                        errorMessage={errors.email}
                        required
                    />
                    <FormInput
                        label="Create Password"
                        id="password"
                        type="password"
                        value={data.password}
                        placeholder="Masukkan password disini"
                        onChange={(e) => {
                            setData("password", e.target.value);
                            setData("password_confirmation", e.target.value);
                        }}
                        errorMessage={errors.password}
                        required
                    />
                    <div className="pt-4">
                        <PrimaryButton disabled={processing}>
                            {processing ? "Memproses..." : "Daftar"}
                        </PrimaryButton>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500 shrink-0">
                    Already have an account?{" "}
                    <Link
                        href={route("login")}
                        className="text-[#1ABCFE] hover:text-[#0c9bd3] transition-colors duration-200 font-medium"
                    >
                        Sign In
                    </Link>
                </div>
                
                <div aria-label="Pilih opsi yang tersedia" className="text-center mt-3 shrink-0 flex justify-center">
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

Register.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default Register;
