<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Services\Seeders\ProductPhotoFetcher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * membuat katalog produk untuk tiap toko pedagang pangandaran.
 *
 * setiap produk mendapat minimal tiga foto yang relevan dengan isinya
 * (mis. udang mendapat foto udang, beras mendapat foto beras). foto diunduh
 * sekali dari wikimedia commons oleh ProductPhotoFetcher lalu disimpan lokal.
 *
 * jalankan dengan:
 *   php artisan db:seed --class=Database\\Seeders\\CatalogSeeder
 *   SEED_SKIP_PHOTOS=true php artisan db:seed  (tanpa unduh foto, hanya baris produk)
 */
class CatalogSeeder extends Seeder
{
    /**
     * kata generik yang tidak boleh muncul di judul foto karena menandakan
     * hasil nyasar (pemandangan, hiasan, dokumen, atau bukan bahan pangan).
     * daftar sengaja lebar karena judul wikimedia commons sering menyesatkan.
     */
    private const COMMON_EXCLUDE = [
        // fauna yang salah / bukan target
        'shark', 'dolphin', 'whale', 'bird', 'insect', 'butterfly',
        // benda & dokumen
        'document', 'archived', 'page', 'scan', 'certificate', 'chart', 'diagram',
        'map', 'logo', 'poster', 'painting', 'drawing', 'illustration', 'draw',
        'stamp', 'coin', 'banknote', 'book', 'cover', 'magazine', 'newspaper',
        'sign', 'label', 'banner', 'screenshot',
        // tekstil / dekorasi nyasar
        'mat', 'carpet', 'rug', 'basket', 'weaving', 'woven', 'textile', 'pattern',
        'wallpaper', 'fabric', 'plate', 'bowl only',
        // manusia & hewan hidup bukan bahan
        'fisherman', 'portrait', 'face', 'man', 'woman', 'people', 'person',
        'child', 'baby', 'hand', 'singer', 'model',
        // olahan bukan bahan mentah yang dikira
        'can', 'tin', 'bottle only', 'packaging', 'aquarium', 'pet',
        'neocaridina', 'morph', 'cherry shrimp', 'hias',
    ];

    /**
     * katalog per email pedagang.
     * tiap produk: nama, kategori, harga, stok, satuan, deskripsi, dan foto
     * berisi kata kunci pencarian + kata inti yang wajib ada di judul foto.
     */
    private const CATALOG = [
        'haji.ujang@cibendamart.com' => [
            [
                'name' => 'Udang Vaname Segar',
                'category' => 'Seafood',
                'price' => 85000,
                'stock' => 40,
                'unit' => 'kg',
                'description' => 'Udang vaname segar hasil tangkapan pagi, ukuran sedang, cocok untuk bakar atau tumis.',
                'photos' => [
                    ['keyword' => 'shrimp', 'must' => ['shrimp', 'prawn']],
                    ['keyword' => 'prawns', 'must' => ['prawn', 'shrimp']],
                    ['keyword' => 'fresh shrimp', 'must' => ['shrimp', 'prawn']],
                ],
            ],
            [
                'name' => 'Ikan Tongkol Segar',
                'category' => 'Seafood',
                'price' => 35000,
                'stock' => 60,
                'unit' => 'kg',
                'description' => 'Tongkol segar berdaging padat, ideal untuk pepes dan sambal tongkol.',
                'photos' => [
                    ['keyword' => 'tuna fish', 'must' => ['tuna']],
                    ['keyword' => 'mackerel', 'must' => ['mackerel']],
                    ['keyword' => 'skipjack tuna', 'must' => ['tuna', 'skipjack']],
                ],
            ],
            [
                'name' => 'Kepiting Bakau',
                'category' => 'Seafood',
                'price' => 120000,
                'stock' => 25,
                'unit' => 'kg',
                'description' => 'Kepiting bakau hidup dari tambak pesisir, manis dan berisi.',
                'photos' => [
                    ['keyword' => 'mud crab', 'must' => ['crab']],
                    ['keyword' => 'crab', 'must' => ['crab']],
                    ['keyword' => 'live crab', 'must' => ['crab']],
                ],
            ],
            [
                'name' => 'Cumi Cumi Segar',
                'category' => 'Seafood',
                'price' => 70000,
                'stock' => 35,
                'unit' => 'kg',
                'description' => 'Cumi segar bersih, siap goreng tepung atau tumis cabai.',
                'photos' => [
                    ['keyword' => 'squid', 'must' => ['squid']],
                    ['keyword' => 'calamari', 'must' => ['calamari', 'squid']],
                    ['keyword' => 'fresh squid', 'must' => ['squid']],
                ],
            ],
            [
                'name' => 'Ikan Kembung Segar',
                'category' => 'Seafood',
                'price' => 30000,
                'stock' => 50,
                'unit' => 'kg',
                'description' => 'Kembung segar berlemak, mantap dibakar dengan sambal kecap.',
                'photos' => [
                    ['keyword' => 'rastrelliger kanagurta', 'must' => ['rastrelliger', 'mackerel']],
                    ['keyword' => 'mackerel market', 'must' => ['mackerel']],
                    ['keyword' => 'fresh mackerel', 'must' => ['mackerel']],
                ],
            ],
            [
                'name' => 'Kerang Hijau',
                'category' => 'Seafood',
                'price' => 25000,
                'stock' => 45,
                'unit' => 'kg',
                'description' => 'Kerang hijau segar dari perairan Pangandaran, cocok dikukus atau saus padang.',
                'photos' => [
                    ['keyword' => 'green mussel', 'must' => ['mussel']],
                    ['keyword' => 'mussels cooked', 'must' => ['mussel']],
                    ['keyword' => 'mussel seafood', 'must' => ['mussel']],
                ],
            ],
        ],
        'ibu.lilis@cibendamart.com' => [
            [
                'name' => 'Kangkung Segar',
                'category' => 'Sayuran',
                'price' => 8000,
                'stock' => 100,
                'unit' => 'ikat',
                'description' => 'Kangkung segar dipetik pagi, cocok ditumis bawang putih.',
                'photos' => [
                    ['keyword' => 'panen kangkung', 'must' => ['kangkung', 'kangkong']],
                    ['keyword' => 'harvested kangkong', 'must' => ['kangkong', 'kangkung']],
                    ['keyword' => 'water spinach leaves', 'must' => ['spinach', 'kangkung', 'kangkong']],
                ],
            ],
            [
                'name' => 'Bayam Hijau',
                'category' => 'Sayuran',
                'price' => 7000,
                'stock' => 120,
                'unit' => 'ikat',
                'description' => 'Bayam hijau muda, daun lembut, baik untuk sayur bening.',
                'photos' => [
                    ['keyword' => 'spinach leaves', 'must' => ['spinach']],
                    ['keyword' => 'fresh spinach', 'must' => ['spinach']],
                    ['keyword' => 'green spinach', 'must' => ['spinach']],
                ],
            ],
            [
                'name' => 'Cabai Merah Keriting',
                'category' => 'Sayuran',
                'price' => 45000,
                'stock' => 60,
                'unit' => 'kg',
                'description' => 'Cabai merah keriting segar, pedas mantap untuk sambal harian.',
                'photos' => [
                    ['keyword' => 'red chili fruits', 'must' => ['chili', 'chilli']],
                    ['keyword' => 'cayenne pepper fruits', 'must' => ['chili', 'chilli', 'cayenne']],
                    ['keyword' => 'harvest red chili', 'must' => ['chili', 'chilli']],
                ],
            ],
            [
                'name' => 'Tomat Merah Segar',
                'category' => 'Sayuran',
                'price' => 15000,
                'stock' => 80,
                'unit' => 'kg',
                'description' => 'Tomat merah matang pohon, manis asam segar untuk masakan.',
                'photos' => [
                    ['keyword' => 'tomatoes', 'must' => ['tomato']],
                    ['keyword' => 'tomato fruits', 'must' => ['tomato']],
                    ['keyword' => 'ripe tomatoes', 'must' => ['tomato']],
                ],
            ],
            [
                'name' => 'Wortel Brastagi',
                'category' => 'Sayuran',
                'price' => 18000,
                'stock' => 70,
                'unit' => 'kg',
                'description' => 'Wortel manis dari dataran tinggi, renyah untuk sup dan capcay.',
                'photos' => [
                    ['keyword' => 'carrots', 'must' => ['carrot']],
                    ['keyword' => 'fresh carrots', 'must' => ['carrot']],
                    ['keyword' => 'carrot harvest', 'must' => ['carrot']],
                ],
            ],
            [
                'name' => 'Brokoli Hijau',
                'category' => 'Sayuran',
                'price' => 25000,
                'stock' => 40,
                'unit' => 'kg',
                'description' => 'Brokoli hijau padat, kaya serat, enak ditumis saus tiram.',
                'photos' => [
                    ['keyword' => 'broccoli', 'must' => ['broccoli']],
                    ['keyword' => 'green broccoli', 'must' => ['broccoli']],
                    ['keyword' => 'fresh broccoli', 'must' => ['broccoli']],
                ],
            ],
            [
                'name' => 'Kacang Panjang',
                'category' => 'Sayuran',
                'price' => 12000,
                'stock' => 90,
                'unit' => 'ikat',
                'description' => 'Kacang panjang muda, manis dan renyah untuk tumis dan lalapan.',
                'photos' => [
                    ['keyword' => 'yardlong bean pod', 'must' => ['bean']],
                    ['keyword' => 'long bean pods', 'must' => ['bean']],
                    ['keyword' => 'snake bean', 'must' => ['bean']],
                ],
            ],
        ],
        'kang.asep@cibendamart.com' => [
            [
                'name' => 'Ayam Kampung Utuh',
                'category' => 'Daging',
                'price' => 65000,
                'stock' => 30,
                'unit' => 'ekor',
                'description' => 'Ayam kampung utuh, daging lebih padat dan gurih untuk opor dan soto.',
                'photos' => [
                    ['keyword' => 'free range chicken', 'must' => ['chicken']],
                    ['keyword' => 'whole raw chicken', 'must' => ['chicken']],
                    ['keyword' => 'chicken meat', 'must' => ['chicken']],
                ],
            ],
            [
                'name' => 'Daging Sapi Segar',
                'category' => 'Daging',
                'price' => 130000,
                'stock' => 25,
                'unit' => 'kg',
                'description' => 'Daging sapi segar bagian sengkel, cocok untuk rendang dan semur.',
                'photos' => [
                    ['keyword' => 'raw beef', 'must' => ['beef']],
                    ['keyword' => 'beef meat', 'must' => ['beef']],
                    ['keyword' => 'fresh beef', 'must' => ['beef']],
                ],
            ],
            [
                'name' => 'Fillet Dada Ayam',
                'category' => 'Daging',
                'price' => 45000,
                'stock' => 50,
                'unit' => 'kg',
                'description' => 'Fillet dada ayam tanpa tulang, praktis untuk diolah dan dibekukan.',
                'photos' => [
                    ['keyword' => 'chicken breast', 'must' => ['chicken']],
                    ['keyword' => 'raw chicken breast', 'must' => ['chicken']],
                    ['keyword' => 'chicken fillet', 'must' => ['chicken']],
                ],
            ],
            [
                'name' => 'Ikan Nila Fillet',
                'category' => 'Daging',
                'price' => 40000,
                'stock' => 35,
                'unit' => 'kg',
                'description' => 'Fillet ikan nila tanpa duri, aman untuk anak dan mudah dimasak.',
                'photos' => [
                    ['keyword' => 'tilapia', 'must' => ['tilapia']],
                    ['keyword' => 'fish fillet', 'must' => ['fish fillet', 'fillet']],
                    ['keyword' => 'raw fish fillet', 'must' => ['fillet']],
                ],
            ],
            [
                'name' => 'Bakso Sapi Premium',
                'category' => 'Daging',
                'price' => 35000,
                'stock' => 60,
                'unit' => 'pack',
                'description' => 'Bakso sapi premium kenyal, isi 25 butir, siap rebus atau bakar.',
                'photos' => [
                    ['keyword' => 'meatballs', 'must' => ['meatball']],
                    ['keyword' => 'beef meatballs', 'must' => ['meatball']],
                    ['keyword' => 'meatball soup', 'must' => ['meatball']],
                ],
            ],
        ],
        'bu.siti@cibendamart.com' => [
            [
                'name' => 'Beras Pandan Wangi',
                'category' => 'Sembako',
                'price' => 75000,
                'stock' => 80,
                'unit' => 'karung 10kg',
                'description' => 'Beras pandan wangi pulen beraroma, hasil panen lokal Ciamis.',
                'photos' => [
                    ['keyword' => 'paddy rice grains', 'must' => ['rice', 'paddy']],
                    ['keyword' => 'jasmine rice bag', 'must' => ['rice']],
                    ['keyword' => 'white rice grains bowl', 'must' => ['rice']],
                ],
            ],
            [
                'name' => 'Minyak Goreng Sawit',
                'category' => 'Sembako',
                'price' => 19000,
                'stock' => 100,
                'unit' => 'pouch 2L',
                'description' => 'Minyak goreng sawit kemasan pouch 2 liter, jernih dan hemat.',
                'photos' => [
                    ['keyword' => 'cooking oil pour', 'must' => ['oil']],
                    ['keyword' => 'peanut oil bottle', 'must' => ['oil']],
                    ['keyword' => 'vegetable oil bottle', 'must' => ['oil']],
                ],
            ],
            [
                'name' => 'Gula Pasir Premium',
                'category' => 'Sembako',
                'price' => 16000,
                'stock' => 120,
                'unit' => 'kg',
                'description' => 'Gula pasir premium putih bersih, butiran halus mudah larut.',
                'photos' => [
                    ['keyword' => 'white sugar', 'must' => ['sugar']],
                    ['keyword' => 'sugar crystals', 'must' => ['sugar']],
                    ['keyword' => 'granulated sugar', 'must' => ['sugar']],
                ],
            ],
            [
                'name' => 'Telur Ayam Negeri',
                'category' => 'Sembako',
                'price' => 30000,
                'stock' => 90,
                'unit' => 'tray 30 butir',
                'description' => 'Telur ayam negeri segar satu tray isi 30 butir, cangkang utuh.',
                'photos' => [
                    ['keyword' => 'chicken eggs', 'must' => ['egg']],
                    ['keyword' => 'fresh eggs', 'must' => ['egg']],
                    ['keyword' => 'brown eggs', 'must' => ['egg']],
                ],
            ],
            [
                'name' => 'Tepung Terigu Serbaguna',
                'category' => 'Sembako',
                'price' => 14000,
                'stock' => 110,
                'unit' => 'kg',
                'description' => 'Tepung terigu serbaguna protein sedang, untuk kue dan gorengan.',
                'photos' => [
                    ['keyword' => 'wheat flour', 'must' => ['flour']],
                    ['keyword' => 'all purpose flour', 'must' => ['flour']],
                    ['keyword' => 'flour', 'must' => ['flour']],
                ],
            ],
            [
                'name' => 'Mie Instan Goreng',
                'category' => 'Sembako',
                'price' => 3500,
                'stock' => 300,
                'unit' => 'pcs',
                'description' => 'Mie instan goreng rasa original, stok makan cepat saji harian.',
                'photos' => [
                    ['keyword' => 'instant noodles', 'must' => ['noodle']],
                    ['keyword' => 'fried noodles', 'must' => ['noodle']],
                    ['keyword' => 'packet noodles', 'must' => ['noodle']],
                ],
            ],
        ],
        'bu.endah@cibendamart.com' => [
            [
                'name' => 'Bawang Merah Brebes',
                'category' => 'Bumbu Dapur',
                'price' => 38000,
                'stock' => 70,
                'unit' => 'kg',
                'description' => 'Bawang merah Brebes beraroma tajam, untuk bumbu dasar semua masakan.',
                'photos' => [
                    ['keyword' => 'shallots', 'must' => ['shallot']],
                    ['keyword' => 'red onions', 'must' => ['onion', 'shallot']],
                    ['keyword' => 'shallot', 'must' => ['shallot']],
                ],
            ],
            [
                'name' => 'Bawang Putih Kating',
                'category' => 'Bumbu Dapur',
                'price' => 42000,
                'stock' => 65,
                'unit' => 'kg',
                'description' => 'Bawang putih kating besar, mudah dikupas dan wangi.',
                'photos' => [
                    ['keyword' => 'garlic bulbs', 'must' => ['garlic']],
                    ['keyword' => 'garlic', 'must' => ['garlic']],
                    ['keyword' => 'fresh garlic', 'must' => ['garlic']],
                ],
            ],
            [
                'name' => 'Cabai Rawit Merah',
                'category' => 'Bumbu Dapur',
                'price' => 55000,
                'stock' => 50,
                'unit' => 'kg',
                'description' => 'Cabai rawit merah kecil super pedas, favorit untuk sambal.',
                'photos' => [
                    ['keyword' => 'bird eye chili', 'must' => ['chili', 'chilli']],
                    ['keyword' => 'red chili', 'must' => ['chili', 'chilli']],
                    ['keyword' => 'chili pepper', 'must' => ['chili', 'chilli']],
                ],
            ],
            [
                'name' => 'Kunyit Dan Jahe Segar',
                'category' => 'Bumbu Dapur',
                'price' => 22000,
                'stock' => 60,
                'unit' => 'pack',
                'description' => 'Paket kunyit dan jahe segar untuk jamu dan bumbu kuning.',
                'photos' => [
                    ['keyword' => 'turmeric rhizome', 'must' => ['turmeric']],
                    ['keyword' => 'ginger rhizome', 'must' => ['ginger']],
                    ['keyword' => 'fresh ginger roots', 'must' => ['ginger']],
                ],
            ],
            [
                'name' => 'Lengkuas Dan Sereh',
                'category' => 'Bumbu Dapur',
                'price' => 18000,
                'stock' => 55,
                'unit' => 'pack',
                'description' => 'Lengkuas dan sereh segar, aromatik untuk ungkep dan soto.',
                'photos' => [
                    ['keyword' => 'galangal', 'must' => ['galangal']],
                    ['keyword' => 'lemongrass', 'must' => ['lemongrass', 'lemon grass']],
                    ['keyword' => 'lemongrass stalks', 'must' => ['lemongrass', 'lemon grass']],
                ],
            ],
            [
                'name' => 'Merica Butiran',
                'category' => 'Bumbu Dapur',
                'price' => 60000,
                'stock' => 45,
                'unit' => 'kg',
                'description' => 'Merica butiran lada hitam, pedas hangat untuk bumbu tumis.',
                'photos' => [
                    ['keyword' => 'black peppercorns', 'must' => ['pepper']],
                    ['keyword' => 'black pepper', 'must' => ['pepper']],
                    ['keyword' => 'peppercorns', 'must' => ['pepper']],
                ],
            ],
        ],
        'kang.dedi@cibendamart.com' => [
            [
                'name' => 'Kaos Pantai Motif Pangandaran',
                'category' => 'Pakaian',
                'price' => 65000,
                'stock' => 80,
                'unit' => 'pcs',
                'description' => 'Kaos katun combed 30s motif pesisir Pangandaran, nyaman dan adem.',
                'photos' => [
                    ['keyword' => 't-shirt cotton clothing', 'must' => ['shirt', 'tshirt', 't-shirt']],
                    ['keyword' => 'tshirt clothing', 'must' => ['shirt', 'tshirt', 't-shirt']],
                    ['keyword' => 't-shirt on hanger', 'must' => ['shirt', 'tshirt', 't-shirt']],
                ],
            ],
            [
                'name' => 'Gamis Santai Wanita',
                'category' => 'Pakaian',
                'price' => 145000,
                'stock' => 40,
                'unit' => 'pcs',
                'description' => 'Gamis santai bahan rayon jatuh, pas untuk liburan ke pantai.',
                'photos' => [
                    ['keyword' => 'abaya hijab', 'must' => ['abaya', 'hijab']],
                    ['keyword' => 'abaya woman', 'must' => ['abaya']],
                    ['keyword' => 'muslim dress', 'must' => ['dress', 'abaya']],
                ],
            ],
            [
                'name' => 'Celana Pendek Pantai',
                'category' => 'Pakaian',
                'price' => 55000,
                'stock' => 70,
                'unit' => 'pcs',
                'description' => 'Celana pendek bahan cepat kering, praktis untuk aktivitas pantai.',
                'photos' => [
                    ['keyword' => 'folded clothes', 'must' => ['folded', 'short', 'clothing']],
                    ['keyword' => 'denim shorts hanging', 'must' => ['short']],
                    ['keyword' => 'shorts clothing', 'must' => ['short']],
                ],
            ],
            [
                'name' => 'Topi Pantai Anyaman',
                'category' => 'Pakaian',
                'price' => 40000,
                'stock' => 60,
                'unit' => 'pcs',
                'description' => 'Topi anyaman pandan khas pesisir, melindungi dari sinar matahari.',
                'photos' => [
                    ['keyword' => 'handwoven straw hat', 'must' => ['straw', 'woven', 'handwoven']],
                    ['keyword' => 'woven straw hat', 'must' => ['straw', 'woven']],
                    ['keyword' => 'straw hat product', 'must' => ['straw hat']],
                ],
            ],
            [
                'name' => 'Tas Kanvas Souvenir',
                'category' => 'Pakaian',
                'price' => 50000,
                'stock' => 55,
                'unit' => 'pcs',
                'description' => 'Tas kanvas souvenir dengan sablon motif laut, kuat dan muat banyak.',
                'photos' => [
                    ['keyword' => 'canvas tote bag', 'must' => ['bag', 'tote']],
                    ['keyword' => 'cloth bag', 'must' => ['bag']],
                    ['keyword' => 'tote bag', 'must' => ['bag', 'tote']],
                ],
            ],
        ],
    ];

    public function run(): void
    {
        $skipPhotos = (bool) env('SEED_SKIP_PHOTOS', false);
        $fetcher = $skipPhotos ? null : app(ProductPhotoFetcher::class);
        $fetched = [];
        $productsWithPhotos = [];

        foreach (self::CATALOG as $merchantEmail => $products) {
            $store = Store::whereHas('user', fn ($q) => $q->where('email', $merchantEmail))->first();

            if (! $store) {
                $this->command?->warn("toko untuk {$merchantEmail} tidak ditemukan, dilewati.");

                continue;
            }

            foreach ($products as $data) {
                $category = Category::firstOrCreate(
                    ['name' => $data['category']],
                    ['slug' => Str::slug($data['category'])]
                );

                $slug = Str::slug($data['name']);

                $product = Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'store_id' => $store->id,
                        'category_id' => $category->id,
                        'name' => $data['name'],
                        'slug' => $slug,
                        'description' => $data['description'],
                        'price' => $data['price'],
                        'stock' => $data['stock'],
                        'unit' => $data['unit'],
                        'is_active' => true,
                    ]
                );

                if ($fetcher === null) {
                    $this->command?->warn("produk {$data['name']} dibuat tanpa foto (SEED_SKIP_PHOTOS).");

                    continue;
                }

                $photoPaths = $this->resolvePhotos($fetcher, $fetched, $slug, $data['photos']);

                // idempoten: bersihkan foto lama lalu tulis ulang set yang konsisten.
                $product->images()->delete();

                foreach ($photoPaths as $index => $relative) {
                    $product->images()->create(['image_path' => '/storage/'.$relative]);

                    if ($index === 0) {
                        $product->update(['image_path' => '/storage/'.$relative]);
                    }
                }

                $productsWithPhotos[] = count($photoPaths);
            }
        }

        if ($fetcher !== null) {
            $totalPhotos = array_sum($productsWithPhotos);
            $this->command?->info(count($productsWithPhotos)." produk mendapat {$totalPhotos} foto relevan dari wikimedia commons.");
        }
    }

    /**
     * unduh foto untuk satu produk. nama file di-prefix slug produk agar tiap
     * produk punya set file sendiri (kata kunci boleh sama, hasil tidak bentrok
     * karena judul file ikut nomor urut).
     *
     * @param  array<string, array<int, string>>  $fetched  cache per kata kunci
     * @param  array<int, array{keyword: string, must: array<int, string>}>  $photos
     * @return array<int, string>
     */
    private function resolvePhotos(?ProductPhotoFetcher $fetcher, array &$fetched, string $slug, array $photos): array
    {
        if ($fetcher === null) {
            return [];
        }

        $paths = [];
        foreach ($photos as $index => $photo) {
            $cacheKey = $slug.'|'.$index;

            if (! isset($fetched[$cacheKey])) {
                $paths[] = $fetcher->fetch(
                    keyword: $photo['keyword'],
                    filenameBase: $slug.'-'.($index + 1),
                    count: 1,
                    mustContain: $photo['must'],
                    exclude: self::COMMON_EXCLUDE,
                )[0];
            } else {
                $paths[] = $fetched[$cacheKey];
            }
        }

        return $paths;
    }
}
