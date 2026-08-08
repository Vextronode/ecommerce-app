import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import Navbar from '@/Components/Global/Navbar';
import Footer from '@/Components/Global/Footer';
import StoreHeader from '@/Components/Storefront/StoreDetail/StoreHeader';
import StoreFilters from '@/Components/Storefront/StoreDetail/StoreFilters';
import ShopProductRow from '@/Components/Storefront/ShopProductRow';
import ProductCard from '@/Components/Storefront/ProductCard';

interface Props {
    store: any;
    isFollowing: boolean;
    categories: any[];
    products: any;
    groupedProducts: any[];
    filters: {
        tab: string;
        filter: string;
        search: string;
        category_id?: string;
    };
}

export default function StoreDetail({ store, isFollowing, categories, products, groupedProducts, filters }: Props) {
    const [currentTab, setCurrentTab] = useState(filters.tab || 'beranda');
    const [currentFilter, setCurrentFilter] = useState(filters.filter || 'populer');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    React.useEffect(() => {
        setCurrentTab(filters.tab || 'beranda');
        setCurrentFilter(filters.filter || 'populer');
        setSearchQuery(filters.search || '');
    }, [filters]);

    const handleFilterChange = (filter: string) => {
        setCurrentFilter(filter);
        // Selalu pindah ke tab 'produk' jika sedang menggunakan filter agar hasil terlihat
        const newTab = 'produk';
        setCurrentTab(newTab);
        updateRoute({ filter, tab: newTab, search: searchQuery, category_id: filters.category_id });
    };

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
        updateRoute({ tab, filter: currentFilter, search: searchQuery, category_id: tab === 'kategori' ? filters.category_id : undefined });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Selalu pindah ke tab 'produk' jika sedang mencari agar hasil terlihat
        const newTab = 'produk';
        setCurrentTab(newTab);
        updateRoute({ search: searchQuery, tab: newTab, filter: currentFilter, category_id: filters.category_id });
    };

    const updateRoute = (params: any) => {
        router.get(route('store.detail', store.slug), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleFollow = () => {
        // Implement Follow logic here when ready
        // router.post(route('store.follow', store.id), {}, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title={`${store.name} - Cibenda Mart`} />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 space-y-6">

                <StoreHeader
                    store={store}
                    isFollowing={isFollowing}
                    onFollow={handleFollow}
                />

                <StoreFilters
                    currentFilter={currentFilter}
                    onFilterChange={handleFilterChange}
                />

                {/* Tabs & Search Container */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4 mb-8">
                        <div className="flex items-center gap-6">
                            {['beranda', 'produk', 'kategori'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`text-base font-bold pb-4 -mb-[17px] border-b-2 whitespace-nowrap transition-colors ${currentTab === tab
                                        ? "border-[#245D56] text-[#245D56]"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-full md:w-64 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent rounded-lg text-sm focus:border-gray-200 focus:bg-white focus:ring-0 transition-all placeholder:text-gray-400"
                            />
                        </form>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-12">
                        {currentTab === 'beranda' && (
                            <>
                                {groupedProducts.length > 0 ? (
                                    groupedProducts.map((group, idx) => (
                                        <ShopProductRow
                                            key={idx}
                                            title={group.title}
                                            products={group.products}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        Belum ada produk di toko ini.
                                    </div>
                                )}
                            </>
                        )}

                        {currentTab === 'produk' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Semua Produk</h2>
                                {products.data.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {products.data.map((product: any) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        Tidak ada produk yang cocok dengan pencarian Anda.
                                    </div>
                                )}
                            </div>
                        )}

                        {currentTab === 'kategori' && (
                            <div>
                                {filters.category_id ? (
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={() => updateRoute({ tab: 'kategori', category_id: null })}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                            </button>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                Produk Kategori: {categories.find(c => c.id == filters.category_id)?.name}
                                            </h2>
                                        </div>
                                        {products.data && products.data.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                                {products.data.map((product: any) => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 py-12">
                                                Tidak ada produk dalam kategori ini.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Kategori Toko</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {categories.map((cat: any) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => updateRoute({ tab: 'kategori', category_id: cat.id })}
                                                    className="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-100 rounded-2xl p-6 text-center transition-all group flex flex-col items-center justify-center gap-2"
                                                >
                                                    <h3 className="font-bold text-gray-700 group-hover:text-teal-700 text-lg">
                                                        {cat.name}
                                                    </h3>
                                                    <span className="text-xs font-medium bg-gray-200 text-gray-600 group-hover:bg-teal-200 group-hover:text-teal-800 px-3 py-1 rounded-full">
                                                        {cat.products_count > 100 ? '99+' : cat.products_count} Produk
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
