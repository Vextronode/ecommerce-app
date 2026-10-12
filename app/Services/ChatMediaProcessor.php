<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * normalisasi media chat sebelum disimpan.
 *
 * gambar di-decode ulang lewat GD lalu di-encode ulang ke format bersih,
 * sehingga metadata exif (gps, timestamp, model kamera) ikut terbuang dan
 * payload tersembunyi di dalam file tidak ikut tersalin. video dilewatkan apa
 * adanya tapi tetap dapat nama acak supaya tidak bisa ditarget lewat nama asli.
 */
class ChatMediaProcessor
{
    private const MAX_IMAGE_DIMENSION = 2560;
    private const JPEG_QUALITY = 82;

    /**
     * proses file media lalu simpan ke disk, kembalikan [path, type].
     *
     * @return array{0: string, 1: string}
     */
    public function store(UploadedFile $file, string $directory = 'chat_media', string $disk = 'public'): array
    {
        $mime = (string) $file->getMimeType();

        if (str_starts_with($mime, 'video/')) {
            return [$this->storeRawVideo($file, $directory, $disk), 'video'];
        }

        return [$this->storeReencodedImage($file, $mime, $directory, $disk), 'image'];
    }

    private function storeReencodedImage(UploadedFile $file, string $mime, string $directory, string $disk): string
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($source === false) {
            throw new RuntimeException('Gambar tidak bisa diproses.');
        }

        $normalized = $this->normalizeOrientation($source, $file->getRealPath(), $mime);
        $resized = $this->downscale($normalized, self::MAX_IMAGE_DIMENSION);
        if ($resized !== $normalized && $normalized !== $source) {
            imagedestroy($normalized);
        }
        if ($normalized !== $source) {
            imagedestroy($source);
        }

        $encoded = $this->encode($resized, $mime);
        imagedestroy($resized);

        if ($encoded === null) {
            throw new RuntimeException('Gagal meng-encode ulang gambar.');
        }

        $path = trim($directory, '/').'/'.Str::random(40).'.'.$this->extensionFor($mime);
        Storage::disk($disk)->put($path, $encoded);

        return $path;
    }

    private function storeRawVideo(UploadedFile $file, string $directory, string $disk): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: 'mp4');
        if (! in_array($extension, ['mp4', 'mov'], true)) {
            $extension = 'mp4';
        }

        $path = trim($directory, '/').'/'.Str::random(40).'.'.$extension;
        Storage::disk($disk)->put($path, (string) file_get_contents($file->getRealPath()));

        return $path;
    }

    /**
     * @param  resource|\GdImage  $image
     * @return resource|\GdImage
     */
    private function normalizeOrientation($image, string $path, string $mime)
    {
        if ($mime !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($path);
        $orientation = $exif['Orientation'] ?? 1;

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => null,
        };

        if ($rotated !== null && $rotated !== false) {
            imagedestroy($image);

            return $rotated;
        }

        return $image;
    }

    /**
     * @param  resource|\GdImage  $image
     * @return resource|\GdImage
     */
    private function downscale($image, int $maxDimension)
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= $maxDimension && $height <= $maxDimension) {
            return $image;
        }

        $ratio = min($maxDimension / $width, $maxDimension / $height);
        $targetWidth = max(1, (int) round($width * $ratio));
        $targetHeight = max(1, (int) round($height * $ratio));

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        return $canvas;
    }

    /**
     * @param  resource|\GdImage  $image
     */
    private function encode($image, string $mime): ?string
    {
        ob_start();

        $ok = match ($mime) {
            'image/png' => imagepng($image, null, 6),
            'image/webp' => imagewebp($image, null, self::JPEG_QUALITY),
            'image/gif' => imagegif($image),
            default => imagejpeg($image, null, self::JPEG_QUALITY),
        };

        $data = ob_get_clean();

        return ($ok && $data !== false && $data !== '') ? $data : null;
    }

    private function extensionFor(string $mime): string
    {
        return match ($mime) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'jpg',
        };
    }
}
