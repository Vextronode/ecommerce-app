<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    use HasFactory;

    public const TYPE_BOOLEAN = 'boolean';
    public const TYPE_NUMBER = 'number';
    public const TYPE_STRING = 'string';
    public const TYPE_JSON = 'json';

    public const GROUP_FINANCE = 'finance';
    public const GROUP_FEATURE_FLAGS = 'feature_flags';
    public const GROUP_GENERAL = 'general';

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * Cache key helper for single setting.
     */
    public static function cacheKey(string $key): string
    {
        return "platform_setting_{$key}";
    }

    /**
     * Model boot listeners for cache invalidation.
     */
    protected static function booted(): void
    {
        static::saved(function (self $setting) {
            Cache::forget(self::cacheKey($setting->key));
            Cache::forget('platform_settings_all');
        });

        static::deleted(function (self $setting) {
            Cache::forget(self::cacheKey($setting->key));
            Cache::forget('platform_settings_all');
        });
    }

    /**
     * Retrieve a typed setting value with permanent caching.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $cached = Cache::rememberForever(self::cacheKey($key), function () use ($key) {
            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return ['exists' => false, 'value' => null];
            }

            return [
                'exists' => true,
                'value' => $setting->castValue($setting->value, $setting->type),
            ];
        });

        if (! is_array($cached) || ! ($cached['exists'] ?? false)) {
            return $default;
        }

        return $cached['value'];
    }

    /**
     * Store or update a setting value, clearing the cache immediately.
     */
    public static function set(string $key, mixed $value): void
    {
        $setting = static::where('key', $key)->first();

        if ($setting) {
            $setting->value = static::serializeValue($value, $setting->type);
            $setting->save();
        } else {
            static::create([
                'key' => $key,
                'value' => static::serializeValue($value, 'string'),
                'type' => 'string',
                'group' => 'general',
                'label' => $key,
            ]);
        }

        Cache::forget(self::cacheKey($key));
        Cache::forget('platform_settings_all');
    }

    /**
     * Convenient check if a boolean feature/setting is enabled.
     */
    public static function isEnabled(string $key, bool $default = false): bool
    {
        return (bool) static::get($key, $default);
    }

    /**
     * Cast string database value into native PHP typed value.
     */
    public function castValue(?string $val, ?string $type): mixed
    {
        if ($val === null) {
            return null;
        }

        return match ($type) {
            self::TYPE_BOOLEAN => filter_var($val, FILTER_VALIDATE_BOOLEAN),
            self::TYPE_NUMBER => is_numeric($val)
                ? (str_contains($val, '.') ? (float) $val : (int) $val)
                : 0,
            self::TYPE_JSON => json_decode($val, true),
            default => $val,
        };
    }

    /**
     * Serialize a native PHP typed value into database string format.
     */
    public static function serializeValue(mixed $val, ?string $type = null): ?string
    {
        if ($val === null) {
            return null;
        }

        if (is_bool($val) || $type === self::TYPE_BOOLEAN) {
            return $val ? '1' : '0';
        }

        if (is_array($val) || is_object($val) || $type === self::TYPE_JSON) {
            return json_encode($val);
        }

        return (string) $val;
    }

    /**
     * Accessor for typed value directly from model instance.
     */
    public function getTypedValueAttribute(): mixed
    {
        return $this->castValue($this->value, $this->type);
    }
}
