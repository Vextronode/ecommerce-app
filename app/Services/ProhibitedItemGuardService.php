<?php

namespace App\Services;

class ProhibitedItemGuardService
{
    /**
     * Periksa apakah teks memuat kata kunci barang terlarang sesuai S&K.
     *
     * @param  string|null  $text
     * @return array{keyword: string, matched_term: string, category_key: string, category_label: string, reference: string, message: string}|null
     */
    public function check(?string $text): ?array
    {
        if (empty($text) || ! config('prohibited_items.enabled', true)) {
            return null;
        }

        $cleanText = strip_tags($text);
        $categories = config('prohibited_items.categories', []);

        foreach ($categories as $categoryKey => $category) {
            $keywords = $category['keywords'] ?? [];
            $categoryLabel = $category['label'] ?? 'Produk Terlarang';
            $reference = $category['reference'] ?? 'Syarat dan Ketentuan Platform';

            foreach ($keywords as $keyword) {
                $trimmedKeyword = trim($keyword);
                if ($trimmedKeyword === '') {
                    continue;
                }

                // Bangun pola regex dengan word boundaries dan fleksibilitas spasi/strip
                $escaped = preg_quote($trimmedKeyword, '/');
                $flexiblePattern = preg_replace('/\s+/', '[\s\-_]*', $escaped);
                $pattern = '/\b'.$flexiblePattern.'\b/ui';

                if (preg_match($pattern, $cleanText, $matches)) {
                    $matchedTerm = $matches[0] ?? $trimmedKeyword;

                    return [
                        'keyword' => $trimmedKeyword,
                        'matched_term' => $matchedTerm,
                        'category_key' => $categoryKey,
                        'category_label' => $categoryLabel,
                        'reference' => $reference,
                        'message' => sprintf(
                            'Produk tidak dapat diunggah/diperbarui karena mengandung kata/istilah yang dilarang platform ("%s") pada kategori %s (%s).',
                            $matchedTerm,
                            $categoryLabel,
                            $reference
                        ),
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Memeriksa apakah teks bersih dari barang terlarang.
     */
    public function isClean(?string $text): bool
    {
        return $this->check($text) === null;
    }
}
