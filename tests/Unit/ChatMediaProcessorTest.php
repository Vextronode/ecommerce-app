<?php

namespace Tests\Unit;

use App\Services\ChatMediaProcessor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChatMediaProcessorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_converts_jpeg_to_webp_and_preserves_dimensions(): void
    {
        $processor = new ChatMediaProcessor;

        $width = 450;
        $height = 320;
        $img = imagecreatetruecolor($width, $height);
        imagefill($img, 0, 0, imagecolorallocate($img, 50, 100, 150));
        ob_start();
        imagejpeg($img, null, 90);
        $rawBytes = ob_get_clean();
        imagedestroy($img);

        $file = UploadedFile::fake()->createWithContent('sample_product.jpg', $rawBytes);

        [$path, $type] = $processor->store($file, 'products', 'public');

        $this->assertSame('image', $type);
        $this->assertStringStartsWith('products/', $path);
        $this->assertStringEndsWith('.webp', $path);
        Storage::disk('public')->assertExists($path);

        $content = Storage::disk('public')->get($path);
        $this->assertStringStartsWith('RIFF', $content);
        $this->assertSame('WEBP', substr($content, 8, 4));

        // Verifikasi resolusi tidak berubah sama sekali
        $decoded = imagecreatefromstring($content);
        $this->assertNotFalse($decoded);
        $this->assertSame($width, imagesx($decoded));
        $this->assertSame($height, imagesy($decoded));
        imagedestroy($decoded);
    }

    public function test_converts_png_with_transparency_to_webp_and_preserves_alpha(): void
    {
        $processor = new ChatMediaProcessor;

        $width = 150;
        $height = 150;
        $img = imagecreatetruecolor($width, $height);
        imagealphablending($img, false);
        imagesavealpha($img, true);

        // Background transparan
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $transparent);

        // Lingkaran solid di tengah
        $solid = imagecolorallocatealpha($img, 255, 0, 0, 0);
        imagefilledellipse($img, 75, 75, 50, 50, $solid);

        ob_start();
        imagepng($img);
        $rawBytes = ob_get_clean();
        imagedestroy($img);

        $file = UploadedFile::fake()->createWithContent('transparent_logo.png', $rawBytes);

        [$path, $type] = $processor->store($file, 'profile-photos', 'public');

        $this->assertSame('image', $type);
        $this->assertStringStartsWith('profile-photos/', $path);
        $this->assertStringEndsWith('.webp', $path);
        Storage::disk('public')->assertExists($path);

        $content = Storage::disk('public')->get($path);
        $this->assertStringStartsWith('RIFF', $content);
        $this->assertSame('WEBP', substr($content, 8, 4));

        // Verifikasi channel alpha tetap transparan
        $decoded = imagecreatefromstring($content);
        $this->assertNotFalse($decoded);
        $cornerColor = imagecolorat($decoded, 0, 0);
        $cornerAlpha = ($cornerColor >> 24) & 0x7F;
        // alpha 127 adalah full transparent di GD
        $this->assertGreaterThan(120, $cornerAlpha);
        imagedestroy($decoded);
    }

    public function test_preserves_gif_format_for_animations(): void
    {
        $processor = new ChatMediaProcessor;

        $img = imagecreate(50, 50);
        imagecolorallocate($img, 255, 200, 0);
        ob_start();
        imagegif($img);
        $rawBytes = ob_get_clean();
        imagedestroy($img);

        $file = UploadedFile::fake()->createWithContent('animated.gif', $rawBytes);

        [$path, $type] = $processor->store($file, 'chat_media', 'public');

        $this->assertSame('image', $type);
        $this->assertStringStartsWith('chat_media/', $path);
        $this->assertStringEndsWith('.gif', $path);
        Storage::disk('public')->assertExists($path);

        $content = Storage::disk('public')->get($path);
        $this->assertStringStartsWith('GIF8', $content);
    }

    public function test_downscales_only_if_exceeding_max_dimension(): void
    {
        $processor = new ChatMediaProcessor;

        $origWidth = 3000;
        $origHeight = 1500;
        $img = imagecreatetruecolor($origWidth, $origHeight);
        ob_start();
        imagejpeg($img, null, 75);
        $rawBytes = ob_get_clean();
        imagedestroy($img);

        $file = UploadedFile::fake()->createWithContent('giant_photo.jpg', $rawBytes);

        [$path, $type] = $processor->store($file, 'products', 'public');

        $content = Storage::disk('public')->get($path);
        $decoded = imagecreatefromstring($content);

        $this->assertSame(2560, imagesx($decoded));
        $this->assertSame(1280, imagesy($decoded));
        imagedestroy($decoded);
    }
}
