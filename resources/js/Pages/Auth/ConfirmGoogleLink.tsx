import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmGoogleLink({ email, nonce }: { email: string; nonce: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        nonce: nonce,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('google.link.confirmed'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Taut Akun Google" />

            <div className="mb-4 text-sm text-gray-600">
                Email <span className="font-semibold">{email}</span> sudah
                terdaftar dengan password. Masukkan password akun Anda untuk
                menautkan akun Google ini, lalu Anda akan otomatis login.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Tautkan & Login
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
