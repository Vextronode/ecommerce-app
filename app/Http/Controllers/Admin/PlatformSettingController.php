<?php

namespace App\Http\Controllers\Admin;

use App\Events\PlatformSettingsUpdated;
use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Database\Seeders\PlatformSettingSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingController extends Controller
{
    public function index(): Response
    {
        if (PlatformSetting::count() === 0) {
            (new PlatformSettingSeeder)->run();
        }

        $settings = PlatformSetting::orderBy('group')
            ->orderBy('id')
            ->get()
            ->map(function (PlatformSetting $setting) {
                return [
                    'id' => $setting->id,
                    'key' => $setting->key,
                    'value' => $setting->typed_value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'label' => $setting->label,
                    'description' => $setting->description,
                ];
            });

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:platform_settings,key'],
            'settings.*.value' => ['nullable'],
        ]);

        $oldSettings = PlatformSetting::getAll();

        foreach ($validated['settings'] as $item) {
            $key = $item['key'];
            $value = $item['value'] ?? null;

            if ($key === 'tax_percentage' && $value !== null) {
                if (! is_numeric($value) || $value < 0 || $value > 100) {
                    return back()->withErrors(['tax_percentage' => 'Persentase pajak harus berupa angka antara 0 dan 100.']);
                }
            }

            if ($key === 'service_fee_amount' && $value !== null) {
                if (! is_numeric($value) || $value < 0) {
                    return back()->withErrors(['service_fee_amount' => 'Biaya layanan harus berupa angka positif.']);
                }
            }

            PlatformSetting::set($key, $value);
        }

        Cache::forget('platform_settings_all');
        $allSettings = PlatformSetting::getAll();

        $changedKeys = [];
        foreach ($allSettings as $key => $val) {
            if (! array_key_exists($key, $oldSettings) || $oldSettings[$key] !== $val) {
                $changedKeys[] = $key;
            }
        }

        if (! empty($changedKeys)) {
            try {
                broadcast(new PlatformSettingsUpdated($allSettings, $changedKeys));
            } catch (\Throwable $e) {
                Log::warning('PlatformSettingsUpdated broadcast failed: '.$e->getMessage());
            }
        }

        return back()->with('success', 'Pengaturan platform berhasil diperbarui.');
    }
}
