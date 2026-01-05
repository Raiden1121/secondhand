import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { categories, departments } from '../data/mock';

const sortOptions = [
    { value: 'default', label: '預設排序' },
    { value: 'price-asc', label: '價格：低到高' },
    { value: 'price-desc', label: '價格：高到低' },
    { value: 'favorites-desc', label: '收藏數：多到少' },
    { value: 'favorites-asc', label: '收藏數：少到多' },
    { value: 'name-asc', label: '名稱：A-Z' },
    { value: 'name-desc', label: '名稱：Z-A' },
];

const HomePage = ({ setCurrentPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [selectedDept, setSelectedDept] = useState('全部系所');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Get current user ID to exclude their products
                let url = 'http://localhost:3000/api/products';
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        if (payload.id) {
                            url += `?excludeUserId=${payload.id}`;
                        }
                    } catch (e) {
                        // Invalid token, continue without filter
                    }
                }

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchCategory = selectedCategory === '全部' || product.category === selectedCategory;
        const matchDept = selectedDept === '全部系所' || product.seller?.department === selectedDept;
        const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchDept && matchSearch;
    });

    // Sort products (reserved always last)
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        // Reserved products always at the end
        if (a.reserved !== b.reserved) {
            return a.reserved ? 1 : -1;
        }

        // Apply selected sort
        switch (sortBy) {
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'favorites-desc':
                return (b.favoritesCount || 0) - (a.favoritesCount || 0);
            case 'favorites-asc':
                return (a.favoritesCount || 0) - (b.favoritesCount || 0);
            case 'name-asc':
                return (a.title || '').localeCompare(b.title || '', 'zh-TW');
            case 'name-desc':
                return (b.title || '').localeCompare(a.title || '', 'zh-TW');
            default:
                return 0; // Keep original order (by createdAt from backend)
        }
    });

    return (
        <div className="space-y-5">
            {/* 標語 */}
            <div className="text-center py-6 px-4">
                <h2 className="text-2xl md:text-3xl font-light text-pine-800 mb-2 tracking-wide">傳遞美好，延續故事</h2>
                <p className="text-sm text-pine-600/80">讓每件物品找到下一個珍惜它的人</p>
            </div>

            {/* 搜尋列 */}
            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400" size={20} />
                    <input
                        type="text"
                        placeholder="尋找你需要的物品..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-pine-200 rounded-2xl text-pine-800 placeholder-pine-400 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* 分類篩選 */}
            <div className="px-4">
                <h3 className="text-sm font-medium text-pine-700 mb-3">分類</h3>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm transition ${selectedCategory === cat
                                ? 'bg-pine-800 text-white shadow-md'
                                : 'bg-cream-100 text-pine-600 hover:bg-cream-200 hover:text-pine-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 系所篩選 & 排序 */}
            <div className="px-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-pine-700 mb-3">系所</h3>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-pine-700 mb-3">排序</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 商品列表 */}
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-pine-400">載入中...</div>
                ) : sortedProducts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-pine-400">目前沒有商品</div>
                ) : (
                    sortedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => setCurrentPage('product-' + product.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;
