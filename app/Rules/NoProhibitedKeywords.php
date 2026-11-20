<?php

namespace App\Rules;

use App\Services\ProhibitedItemGuardService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoProhibitedKeywords implements ValidationRule
{
    private ProhibitedItemGuardService $guard;

    public function __construct(?ProhibitedItemGuardService $guard = null)
    {
        $this->guard = $guard ?? app(ProhibitedItemGuardService::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            return;
        }

        $violation = $this->guard->check($value);

        if ($violation !== null) {
            $fail($violation['message']);
        }
    }
}
