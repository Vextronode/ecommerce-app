<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $minimumBirthDate = now()->subYears(13)->toDateString();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'dob' => ['nullable', 'date', 'before_or_equal:' . $minimumBirthDate, 'after_or_equal:1900-01-01'],
        ];
    }

    public function messages(): array
    {
        return [
            'dob.before_or_equal' => 'Tanggal lahir minimal harus menunjukkan umur 13 tahun.',
            'dob.after_or_equal' => 'Tanggal lahir tidak valid.',
        ];
    }
}
