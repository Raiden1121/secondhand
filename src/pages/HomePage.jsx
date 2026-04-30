import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { categories, colleges } from '../data/mock';
import { useTranslation } from 'react-i18next';

const HomePage = ({ setCurrentPage }) => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [selectedCollege, setSelectedCollege] = useState('全部學院');
    const [selectedDept, setSelectedDept] = useState('全部系所');
    const [searchInput, setSearchInput] = useState(''); // User's current input
    const [searchQuery, setSearchQuery] = useState(''); // Actual search query applied
    const [sortBy, setSortBy] = useState('default');

    const sortOptionsKeys = [
        { value: 'default', labelKey: 'home.sort_default' },
        { value: 'price-asc', labelKey: 'home.sort_price_asc' },
        { value: 'price-desc', labelKey: 'home.sort_price_desc' },
        { value: 'favorites-desc', labelKey: 'home.sort_fav_desc' },
        { value: 'favorites-asc', labelKey: 'home.sort_fav_asc' },
        { value: 'name-asc', labelKey: 'home.sort_name_asc' },
        { value: 'name-desc', labelKey: 'home.sort_name_desc' },
    ];

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
                const url = `${import.meta.env.VITE_API_URL}/api/products`;

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

        // Fuzzy search: match in title, description, or category
        const matchSearch = !searchQuery ||
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchQuery.toLowerCase());

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
                <h2 className="text-2xl md:text-3xl font-light text-pine-800 mb-2 tracking-wide">{t('home.slogan')}</h2>
                <p className="text-sm text-pine-600/80">{t('home.sub_slogan')}</p>
            </div>

            {/* 搜尋列 */}
            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('home.search_placeholder')}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-pine-200 rounded-2xl text-pine-800 placeholder-pine-400 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                        value={searchInput}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setSearchInput(newValue);
                            // Auto-search when deleting (text becomes shorter)
                            if (newValue.length < searchInput.length) {
                                setSearchQuery(newValue);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchQuery(searchInput);
                            }
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-pine-400 hover:text-pine-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* 分類篩選 */}
            <div className="px-4">
                <h3 className="text-sm font-medium text-pine-700 mb-3">{t('home.category')}</h3>
                <div className="flex flex-wrap gap-2">
                    {/* The "All" button handles the reset to '全部' state. */}
                    <button
                        onClick={() => setSelectedCategory('全部')}
                        className={`px-4 py-2 rounded-full text-sm transition ${selectedCategory === '全部'
                            ? 'bg-pine-800 text-white shadow-md'
                            : 'bg-cream-100 text-pine-600 hover:bg-cream-200 hover:text-pine-800'
                            }`}
                    >
                        {t('home.all')}
                    </button>

                    {/* Keep the original database-matched category texts for functionality, 
                        or map them to translations if a translation mapping existed. 
                        Since category values are used directly without i18n map currently, we render them directly. */}
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm transition ${selectedCategory === cat
                                ? 'bg-pine-800 text-white shadow-md'
                                : 'bg-cream-100 text-pine-600 hover:bg-cream-200 hover:text-pine-800'
                                }`}
                        >
                            {t(`categories.${cat}`, { defaultValue: cat })}
                        </button>
                    ))}
                </div>
            </div>

            {/* 學院 & 系所篩選 & 排序 */}
            <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-pine-700 mb-3">{t('home.college')}</h3>
                    <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        <option value="全部學院">{t('home.all_colleges')}</option>
                        {colleges.map(college => (
                            <option key={college.name} value={college.name}>{t(`colleges.${college.name}`, { defaultValue: college.name })}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-pine-700 mb-3">{t('home.department')}</h3>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        <option value="全部系所">{t('home.all_departments')}</option>
                        {selectedCollege === '全部學院' ? (
                            // Show all departments grouped by college
                            colleges.filter(c => c.name !== '全部學院').map(college => (
                                <optgroup key={college.name} label={t(`colleges.${college.name}`, { defaultValue: college.name })}>
                                    {college.departments.map(dept => (
                                        <option key={dept} value={dept}>{t(`departments.${dept}`, { defaultValue: dept })}</option>
                                    ))}
                                </optgroup>
                            ))
                        ) : (
                            // Show only departments from selected college
                            availableDepts.filter(d => d !== '全部系所').map(dept => (
                                <option key={dept} value={dept}>{t(`departments.${dept}`, { defaultValue: dept })}</option>
                            ))
                        )}
                    </select>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-pine-700 mb-3">{t('home.sort')}</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-3 bg-white/80 border border-pine-200 rounded-2xl text-pine-700 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition shadow-sm"
                    >
                        {sortOptionsKeys.map(opt => (
                            <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 商品列表 */}
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-pine-400">{t('home.loading')}</div>
                ) : sortedProducts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-pine-400">{t('home.no_products')}</div>
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
