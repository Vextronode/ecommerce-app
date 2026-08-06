<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255', 'required_if:expected_role,admin'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'expected_role' => ['nullable', 'string', 'in:user,pedagang,admin'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $expectedRole = $this->string('expected_role')->toString() ?: 'user';
        $authenticatedUser = Auth::user();
        $authenticatedRole = $authenticatedUser?->role;

        $roleMismatch = match ($expectedRole) {
            'pedagang' => $authenticatedRole !== 'pedagang',
            'admin' => $authenticatedRole !== 'admin',
            default => $authenticatedRole !== 'user',
        };

        if ($roleMismatch) {
            Auth::guard('web')->logout();
            RateLimiter::hit($this->throttleKey());

            $message = match ($expectedRole) {
                'pedagang' => 'Akun ini bukan akun pedagang.',
                'admin' => 'Akun ini tidak memiliki hak akses administrator.',
                default => 'Akun ini tidak bisa dipakai untuk login sebagai pembeli.',
            };

            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        // Additional Security Check for Admin: Verify Full Name Matches
        if ($expectedRole === 'admin') {
            $inputName = trim((string) $this->input('name'));
            $registeredName = trim((string) $authenticatedUser->name);

            if (strcasecmp($inputName, $registeredName) !== 0) {
                Auth::guard('web')->logout();
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'name' => 'Nama lengkap admin tidak sesuai dengan akun terdaftar.',
                ]);
            }
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
