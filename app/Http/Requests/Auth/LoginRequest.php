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
            'email' => ['required', 'string', 'max:255'],
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

        $loginInput = trim((string) $this->input('email'));
        $targetUser = \App\Models\User::where('email', $loginInput)
            ->orWhere('name', $loginInput)
            ->first();

        $credentials = [
            'email' => $targetUser ? $targetUser->email : $loginInput,
            'password' => (string) $this->input('password'),
        ];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey(), 300);
            RateLimiter::hit($this->emailThrottleKey(), 300);

            $retriesLeft = RateLimiter::retriesLeft($this->throttleKey(), 5);
            $msg = 'Email/Username atau kata sandi tidak cocok.';
            if ($retriesLeft > 0) {
                $msg .= " Sisa percobaan: {$retriesLeft} kali lagi.";
            }

            throw ValidationException::withMessages([
                'email' => $msg,
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
            RateLimiter::hit($this->throttleKey(), 300);
            RateLimiter::hit($this->emailThrottleKey(), 300);

            $retriesLeft = RateLimiter::retriesLeft($this->throttleKey(), 5);
            $msg = 'Email atau kata sandi tidak cocok.';
            if ($retriesLeft > 0) {
                $msg .= " Sisa percobaan: {$retriesLeft} kali lagi.";
            }

            // Generic error message to prevent User Enumeration and Role Disclosure
            throw ValidationException::withMessages([
                'email' => $msg,
            ]);
        }

        // Additional Security Check for Admin: Verify Full Name Matches
        if ($expectedRole === 'admin') {
            $inputName = trim((string) $this->input('name'));
            $registeredName = trim((string) $authenticatedUser->name);

            if (strcasecmp($inputName, $registeredName) !== 0) {
                Auth::guard('web')->logout();
                RateLimiter::hit($this->throttleKey(), 300);
                RateLimiter::hit($this->emailThrottleKey(), 300);

                $retriesLeft = RateLimiter::retriesLeft($this->throttleKey(), 5);
                $msg = 'Email atau kata sandi tidak cocok.';
                if ($retriesLeft > 0) {
                    $msg .= " Sisa percobaan: {$retriesLeft} kali lagi.";
                }

                // Generic error message to prevent information leakage
                throw ValidationException::withMessages([
                    'email' => $msg,
                ]);
            }
        }

        RateLimiter::clear($this->throttleKey());
        RateLimiter::clear($this->emailThrottleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            event(new Lockout($this));
            $seconds = RateLimiter::availableIn($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Secondary check: max 10 attempts per email across all IPs
        if (RateLimiter::tooManyAttempts($this->emailThrottleKey(), 10)) {
            event(new Lockout($this));
            $seconds = RateLimiter::availableIn($this->emailThrottleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    /**
     * Secondary throttle key based solely on email to prevent distributed brute force.
     */
    public function emailThrottleKey(): string
    {
        return Str::transliterate('login_email_throttle|'.Str::lower($this->string('email')));
    }
}
