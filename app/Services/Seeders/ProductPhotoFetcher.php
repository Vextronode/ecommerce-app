<?php

namespace App\Services\Seeders;

use RuntimeException;
use Throwable;

/**
 * mengunduh foto produk dari wikimedia commons berdasarkan kata kunci.
 *
 * dipakai hanya oleh seeder katalog. sumber dipilih karena lisensinya bebas
 * (public domain / creative commons) dan tersedia lewat api pencarian resmi,
 * sehingga foto yang dihasilkan relevan dengan nama produk.
 *
 * karena judul di wikimedia sering menyesatkan (mis. "mackerel shark" untuk
 * hiu, "ANSOL.org" untuk t-shirt), hasil pencarian TIDAK dipercaya mentah.
 * setiap kandidat diberi skor:
 *   +3 untuk tiap kata inti (must) yang muncul di judul
 *   -10 bila memuat kata larangan (exclude)
 * kandidat dengan skor tertinggi dipilih. bila semua kandidat bernilai
 * negatif/rendah, fetch gagal jujur daripada memasang foto nyasar.
 *
 * setiap file disimpan ke disk public pada folder products dengan nama
 * deterministik agar seeder idempoten.
 */
class ProductPhotoFetcher
{
    private const API_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

    private const USER_AGENT = 'CibendaMartSeeder/1.0 (https://cibendamart.test; demo catalog seeding)';

    private const IMAGE_WIDTH = 900;

    private const MUST_POINTS = 3;

    private const EXCLUDE_PENALTY = 10;

    /**
     * unduh sejumlah foto untuk satu subjek, diurutkan dari skor tertinggi.
     *
     * @param  string  $keyword  kata kunci pencarian (idealnya satu subjek konkret)
     * @param  string  $filenameBase  nama dasar file hasil (tanpa ekstensi)
     * @param  int  $count  jumlah foto minimum yang wajib didapat
     * @param  array<int, string>  $mustContain  kata inti yang menaikkan skor bila ada di judul
     * @param  array<int, string>  $exclude  kata larangan yang menurunkan skor bila ada di judul
     * @return array<int, string> path relatif disk public (mis. products/shrimp-1.jpg)
     */
    public function fetch(
        string $keyword,
        string $filenameBase,
        int $count = 3,
        array $mustContain = [],
        array $exclude = [],
    ): array {
        $candidates = $this->rankedCandidates($keyword, $mustContain, $exclude);

        if (count($candidates) < $count) {
            throw new RuntimeException(
                "kata kunci '{$keyword}' hanya menghasilkan ".count($candidates)." foto layak, butuh {$count}. "
                .'periksa koneksi internet atau perbaiki kata kunci / filter.'
            );
        }

        $paths = [];
        foreach (array_slice($candidates, 0, $count) as $index => $candidate) {
            $paths[] = $this->download($candidate['url'], $filenameBase.'-'.($index + 1));
        }

        return $paths;
    }

    /**
     * cari kandidat lalu urutkan berdasarkan skor relevansi (tertinggi dulu).
     * hanya kandidat berskor positif yang dipertahankan.
     *
     * @param  array<int, string>  $mustContain
     * @param  array<int, string>  $exclude
     * @return array<int, array{url: string, score: int}>
     */
    private function rankedCandidates(string $keyword, array $mustContain, array $exclude): array
    {
        $query = [
            'action' => 'query',
            'generator' => 'search',
            'gsrsearch' => 'filetype:bitmap '.$keyword,
            'gsrnamespace' => 6,
            // ambil kandidat berlebih supaya saringan masih menyisakan cukup foto
            'gsrlimit' => 30,
            'prop' => 'imageinfo',
            'iiprop' => 'url',
            'iiurlwidth' => self::IMAGE_WIDTH,
            'format' => 'json',
        ];

        $url = self::API_ENDPOINT.'?'.http_build_query($query);
        $decoded = json_decode($this->httpGet($url), true);

        if (! is_array($decoded)) {
            throw new RuntimeException("respons wikimedia tidak valid untuk kata kunci '{$keyword}'.");
        }

        $pages = $decoded['query']['pages'] ?? [];
        $seen = [];
        $ranked = [];

        foreach ($pages as $page) {
            $title = strtolower((string) ($page['title'] ?? ''));
            $thumb = $page['imageinfo'][0]['thumburl'] ?? null;

            if (! is_string($thumb) || ! preg_match('/\.(jpe?g|png|webp)$/i', parse_url($thumb, PHP_URL_PATH) ?? '')) {
                continue;
            }

            $urlPath = parse_url($thumb, PHP_URL_PATH) ?? '';
            if (isset($seen[$urlPath])) {
                continue;
            }
            $seen[$urlPath] = true;

            $score = $this->score($title, $mustContain, $exclude);

            if ($score > 0) {
                $ranked[] = ['url' => $thumb, 'score' => $score];
            }
        }

        usort($ranked, fn ($a, $b) => $b['score'] <=> $a['score']);

        return $ranked;
    }

    /**
     * skor relevansi judul foto. kata inti menambah, kata larangan mengurangi.
     *
     * kata inti memakai prefix batas-kata (cocok untuk bentuk jamak/derivatif,
     * mis. "tomato" cocok ke "tomatoes"), sedangkan kata larangan memakai batas
     * kata penuh supaya tidak salah tangkap substring (mis. "mat" tidak cocok
     * ke dalam "toMATo").
     *
     * @param  array<int, string>  $mustContain
     * @param  array<int, string>  $exclude
     */
    private function score(string $title, array $mustContain, array $exclude): int
    {
        $score = 0;

        foreach ($mustContain as $needle) {
            if ($this->containsWordPrefix($title, $needle)) {
                $score += self::MUST_POINTS;
            }
        }

        foreach ($exclude as $blocked) {
            if ($blocked !== '' && $this->containsWord($title, $blocked)) {
                $score -= self::EXCLUDE_PENALTY;
            }
        }

        return $score;
    }

    /**
     * cek apakah judul memuat kata yang dimulai dengan kata inti (prefix pada
     * batas kata). aman untuk varian jamak seperti tomato -> tomatoes.
     */
    private function containsWordPrefix(string $haystack, string $needle): bool
    {
        $needle = strtolower(trim($needle));
        if ($needle === '') {
            return false;
        }

        $pattern = '/\b'.preg_quote($needle, '/').'/u';

        return (bool) preg_match($pattern, $haystack);
    }

    /**
     * cek apakah judul memuat frasa tertentu sebagai kata utuh.
     * frasa multi-kata ("cherry shrimp") dicocokkan apa adanya, kata tunggal
     * memakai batas kata sehingga aman dari substring yang menyesatkan.
     */
    private function containsWord(string $haystack, string $needle): bool
    {
        $needle = strtolower(trim($needle));
        if ($needle === '') {
            return false;
        }

        $pattern = '/\b'.preg_quote($needle, '/').'\b/u';

        return (bool) preg_match($pattern, $haystack);
    }

    /**
     * unduh satu gambar ke disk public dan kembalikan path relatifnya.
     */
    private function download(string $sourceUrl, string $filenameBase): string
    {
        $extension = strtolower(pathinfo(parse_url($sourceUrl, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
        $extension = $extension === 'jpeg' ? 'jpg' : $extension;
        $relative = 'products/'.$filenameBase.'.'.$extension;

        $destination = storage_path('app/public/'.$relative);
        $directory = dirname($destination);

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException("gagal membuat direktori foto produk: {$directory}");
        }

        $binary = $this->httpGet($sourceUrl);

        if ($binary === '' || strlen($binary) < 512) {
            throw new RuntimeException("foto dari {$sourceUrl} terlalu kecil / gagal diunduh.");
        }

        if (@file_put_contents($destination, $binary) === false) {
            throw new RuntimeException("gagal menyimpan foto produk ke {$destination}");
        }

        return $relative;
    }

    /**
     * permintaan http sederhana dengan user agent agar tidak diblokir.
     */
    private function httpGet(string $url): string
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => 'User-Agent: '.self::USER_AGENT."\r\n",
                'timeout' => 30,
                'follow_location' => 1,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);

        try {
            $body = @file_get_contents($url, false, $context);
        } catch (Throwable $e) {
            throw new RuntimeException("gagal mengunduh {$url}: ".$e->getMessage());
        }

        if ($body === false) {
            $error = error_get_last();

            throw new RuntimeException("gagal mengunduh {$url}: ".($error['message'] ?? 'unknown error'));
        }

        return $body;
    }
}
