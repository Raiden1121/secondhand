import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { categories, colleges } from '../data/mock';

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
    const [selectedCollege, setSelectedCollege] = useState('全部學院');
    const [selectedDept, setSelectedDept] = useState('全部系所');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    // Get available departments based on selected college
    const availableDepts = useMemo(() => {
        if (selectedCollege === '全部學院') {
            // Get all departments from all colleges
            return ['全部系所', ...colleges.flatMap(c => c.departments)];
        }
        const college = colleges.find(c => c.name === selectedCollege);
        return college ? ['全部系所', ...college.departments] : ['全部系所'];
    }, [selectedCollege]);

    // Reset department selection when college changes
    useEffect(() => {
        setSelectedDept('全部系所');
    }, [selectedCollege]);

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

        // Department filter: check if product's seller department is in the available list
        let matchDept = true;
        if (selectedDept !== '全部系所') {
            matchDept = product.seller?.department === selectedDept;
        } else if (selectedCollege !== '全部學院') {
            // If college is selected but dept is "全部系所", match any dept in that college
            const college = colleges.find(c => c.name === selectedCollege);
            matchDept = college ? college.departments.includes(product.seller?.department) : true;
        }

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

            {/* 學院 & 系所篩選 & 排序 */}
            <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-pine-700 mb-3">學院</h3>
                    <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        {colleges.map(college => (
                            <option key={college.name} value={college.name}>{college.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-pine-700 mb-3">系所</h3>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        <option value="全部系所">全部系所</option>
                        {selectedCollege === '全部學院' ? (
                            // Show all departments grouped by college
                            colleges.filter(c => c.name !== '全部學院').map(college => (
                                <optgroup key={college.name} label={college.name}>
                                    {college.departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </optgroup>
                            ))
                        ) : (
                            // Show only departments from selected college
                            availableDepts.filter(d => d !== '全部系所').map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))
                        )}
                    </select>
                </div>
                <div>
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
