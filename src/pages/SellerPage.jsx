import React, { useState, useEffect } from 'react';
import { Star, MapPin, Share2, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';

const sortOptions = [
    { value: 'default', label: '預設排序' },
    { value: 'price-asc', label: '價格：低到高' },
    { value: 'price-desc', label: '價格：高到低' },
    { value: 'favorites-desc', label: '收藏數：多到少' },
    { value: 'favorites-asc', label: '收藏數：少到多' },
    { value: 'name-asc', label: '名稱：A-Z' },
    { value: 'name-desc', label: '名稱：Z-A' },
];

const SellerPage = ({ sellerId, setCurrentPage }) => {
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch seller info
                const userRes = await fetch(`http://localhost:3000/api/auth/users/${sellerId}`);
                if (!userRes.ok) throw new Error('找不到賣家資訊');
                const userData = await userRes.json();
                setSeller(userData);

                // Fetch seller products
                const productRes = await fetch(`http://localhost:3000/api/products?sellerId=${sellerId}`);
                if (!productRes.ok) throw new Error('無法載入商品');
                const productData = await productRes.json();
                setProducts(productData);
            } catch (err) {
                console.error('Error fetching seller data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchData();
        }
    }, [sellerId]);

    // Filter products
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                return 0;
        }
    });

    if (loading) return <div className="p-10 text-center text-pine-600">載入中...</div>;
    if (error || !seller) return <div className="p-10 text-center text-pine-600">找不到賣家</div>;

    return (
        <div className="space-y-6">
            {/* Header / Profile Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pine-100 mt-3">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cream-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                        {seller.avatar && seller.avatar.trim() !== '' && !avatarError ? (
                            <img
                                src={`http://localhost:3000${seller.avatar}`}
                                alt={seller.name}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <span className="text-4xl">👤</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-2xl font-medium text-pine-900">{seller.name}</h1>
                            {seller.department && (
                                <span className="text-xs bg-forest-50 text-forest-700 px-2 py-1 rounded-full border border-forest-100 w-fit">
                                    {seller.department}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-pine-500 mb-3">
                            <div className="flex items-center gap-1">
                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                <span className="font-medium text-pine-800">{seller.rating || '4.8'}</span>
                                <span className="text-pine-400">({seller.reviewCount || 12} 則評價)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 px-2">
                    <h2 className="text-lg font-medium text-pine-800 flex items-center gap-2">
                        <span className="text-xl">📦</span> 我的物品
                    </h2>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                        {/* Search within seller */}
                        <input
                            type="text"
                            placeholder="搜尋賣場商品..."
                            className="px-4 py-2 bg-white/50 border border-pine-200 rounded-xl text-sm focus:outline-none focus:border-forest-400 w-full md:w-40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Sort dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-white/50 border border-pine-200 rounded-xl text-sm focus:outline-none focus:border-forest-400 w-full md:w-40"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedProducts.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-pine-400 bg-white/50 rounded-2xl border border-dashed border-pine-200">
                            此賣家目前沒有商品
                        </div>
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
        </div>
    );
};

export default SellerPage;
