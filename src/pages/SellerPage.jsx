import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Share2, ArrowLeft, X, Plus, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { categories, conditions, meetingPointCategories } from '../data/mock';

const sortOptions = [
    { value: 'default', label: '預設排序' },
    { value: 'price-asc', label: '價格：低到高' },
    { value: 'price-desc', label: '價格：高到低' },
    { value: 'favorites-desc', label: '收藏數：多到少' },
    { value: 'favorites-asc', label: '收藏數：少到多' },
    { value: 'name-asc', label: '名稱：A-Z' },
    { value: 'name-desc', label: '名稱：Z-A' },
];

const SellerPage = ({ sellerId, setCurrentPage, onProductClick, currentUserId }) => {
    const isOwner = currentUserId && String(currentUserId) === String(sellerId);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    const [sortBy, setSortBy] = useState('default');
    const [sellerRating, setSellerRating] = useState({ averageScore: 0, totalRatings: 0 });

    // Edit Modal State
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '教科書與書籍',
        price: 0,
        condition: '全新',
        description: ''
    });
    const [imageList, setImageList] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [expandedLocationCategories, setExpandedLocationCategories] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const locationPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`http://localhost:3000/api/auth/users/${sellerId}`);
                if (!userRes.ok) throw new Error('找不到賣家資訊');
                const userData = await userRes.json();
                setSeller(userData);

                const productRes = await fetch(`http://localhost:3000/api/products?sellerId=${sellerId}`);
                if (!productRes.ok) throw new Error('無法載入商品');
                const productData = await productRes.json();
                setProducts(productData);

                const ratingRes = await fetch(`http://localhost:3000/api/ratings/user/${sellerId}`);
                if (ratingRes.ok) {
                    const ratingData = await ratingRes.json();
                    setSellerRating({
                        averageScore: ratingData.averageScore || 0,
                        totalRatings: ratingData.totalRatings || 0
                    });
                }
            } catch (err) {
                console.error('Error fetching seller data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) fetchData();
    }, [sellerId]);

    // Close location picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationPickerRef.current && !locationPickerRef.current.contains(event.target)) {
                setShowLocationPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter and sort products
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (a.reserved !== b.reserved) return a.reserved ? 1 : -1;
        switch (sortBy) {
            case 'price-asc': return (a.price || 0) - (b.price || 0);
            case 'price-desc': return (b.price || 0) - (a.price || 0);
            case 'favorites-desc': return (b.favoritesCount || 0) - (a.favoritesCount || 0);
            case 'favorites-asc': return (a.favoritesCount || 0) - (b.favoritesCount || 0);
            case 'name-asc': return (a.title || '').localeCompare(b.title || '', 'zh-TW');
            case 'name-desc': return (b.title || '').localeCompare(a.title || '', 'zh-TW');
            default: return 0;
        }
    });

    // Edit Modal Functions
    const handleEdit = (product) => {
        let initialImages = [];
        try {
            if (typeof product.images === 'string') {
                initialImages = JSON.parse(product.images);
            } else if (Array.isArray(product.images)) {
                initialImages = product.images;
            }
        } catch (e) {
            initialImages = [];
        }

        const formattedImages = initialImages.map(url => ({
            id: url,
            type: 'existing',
            url: `http://localhost:3000${url}`,
            serverPath: url
        }));
        setImageList(formattedImages);

        setFormData({
            title: product.title,
            category: product.category,
            price: product.price,
            condition: product.condition || '全新',
            description: product.description
        });
        const existingLocations = product.location
            ? product.location.split('、').filter(l => l.trim())
            : [];
        setSelectedLocations(existingLocations);
        setShowLocationPicker(false);
        setExpandedLocationCategories({});
        setEditingProduct(product);
    };

    const handleClose = () => {
        setEditingProduct(null);
        imageList.forEach(item => {
            if (item.type === 'new') URL.revokeObjectURL(item.url);
        });
        setImageList([]);
        setShowDeleteConfirm(false);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const remainingSlots = 5 - imageList.length;
        const filesToAdd = files.slice(0, remainingSlots);
        const newItems = filesToAdd.map(file => ({
            id: URL.createObjectURL(file),
            type: 'new',
            file: file,
            url: URL.createObjectURL(file)
        }));
        setImageList(prev => [...prev, ...newItems]);
        e.target.value = '';
    };

    const removeImage = (id) => {
        const item = imageList.find(i => i.id === id);
        if (item && item.type === 'new') URL.revokeObjectURL(item.url);
        setImageList(prev => prev.filter(i => i.id !== id));
    };

    const toggleLocationCategory = (catName) => {
        setExpandedLocationCategories(prev => ({
            ...prev,
            [catName]: !prev[catName]
        }));
    };

    const toggleLocation = (loc) => {
        setSelectedLocations(prev =>
            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
        );
    };

    const handleSave = async () => {
        if (!formData.title || !formData.price || !formData.description) {
            alert('請填寫完整資訊');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('category', formData.category);
            submitData.append('price', parseInt(formData.price));
            submitData.append('condition', formData.condition);
            submitData.append('description', formData.description);
            submitData.append('location', selectedLocations.join('、'));
            submitData.append('status', editingProduct.status);

            const finalExistingImages = imageList
                .filter(item => item.type === 'existing')
                .map(item => item.serverPath);
            submitData.append('existingImages', JSON.stringify(finalExistingImages));

            let newFileIndex = 0;
            const imageOrder = imageList.map(item => {
                if (item.type === 'existing') return item.serverPath;
                return `new-token-${newFileIndex++}`;
            });
            submitData.append('imageOrder', JSON.stringify(imageOrder));

            imageList.forEach(item => {
                if (item.type === 'new' && item.file) {
                    submitData.append('images', item.file);
                }
            });

            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: submitData
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
                handleClose();
            } else {
                const err = await response.json();
                alert(err.message || '更新失敗');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('系統錯誤，請稍後再試');
        }
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== editingProduct.id));
                setEditingProduct(null);
                setShowDeleteConfirm(false);
            } else {
                const err = await response.json();
                alert(err.message || '刪除失敗');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('系統錯誤，請稍後再試');
        }
    };

    const handleReserveToggle = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reserved: !editingProduct.reserved })
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
                setEditingProduct(updatedProduct);
            }
        } catch (error) {
            console.error('Error toggling reserve:', error);
        }
    };

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
                                <span className="font-medium text-pine-800">{sellerRating.averageScore.toFixed(1)}</span>
                                <span className="text-pine-400">({sellerRating.totalRatings} 則評價)</span>
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
                        <input
                            type="text"
                            placeholder="搜尋賣場商品..."
                            className="px-4 py-2 bg-white/50 border border-pine-200 rounded-xl text-sm focus:outline-none focus:border-forest-400 w-full md:w-40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                isOwner={isOwner}
                                onEdit={handleEdit}
                                onClick={() => {
                                    if (onProductClick) {
                                        onProductClick(product.id, sellerId);
                                    } else {
                                        setCurrentPage('product-' + product.id);
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-medium text-pine-800">編輯物品</h2>
                                <button onClick={handleClose} className="text-pine-400 hover:text-pine-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-2">照片</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {imageList.map((item) => (
                                            <div key={item.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-pine-200">
                                                <img src={item.url} alt="Product" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(item.id)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {imageList.length < 5 && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-20 h-20 border-2 border-dashed border-pine-300 rounded-xl flex flex-col items-center justify-center text-pine-400 hover:border-forest-400 hover:text-forest-600 transition"
                                            >
                                                <Plus size={20} />
                                                <span className="text-xs mt-1">新增</span>
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-2">名稱</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-3 border border-pine-200 rounded-xl focus:outline-none focus:border-forest-400"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-2">分類</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3 border border-pine-200 rounded-xl focus:outline-none focus:border-forest-400"
                                    >
                                        {categories.filter(c => c !== '全部').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price & Condition */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-pine-600 mb-2">價格</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pine-400">NT$</span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-12 pr-3 py-3 border border-pine-200 rounded-xl focus:outline-none focus:border-forest-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-pine-600 mb-2">狀況</label>
                                        <select
                                            value={formData.condition}
                                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                            className="w-full p-3 border border-pine-200 rounded-xl focus:outline-none focus:border-forest-400"
                                        >
                                            {conditions.map(cond => (
                                                <option key={cond} value={cond}>{cond}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-2">說明</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full p-3 border border-pine-200 rounded-xl focus:outline-none focus:border-forest-400 resize-none"
                                    />
                                </div>

                                {/* Location Picker */}
                                <div ref={locationPickerRef}>
                                    <label className="block text-sm font-medium text-pine-600 mb-2">建議面交地點</label>
                                    <div
                                        onClick={() => setShowLocationPicker(!showLocationPicker)}
                                        className="w-full p-3 border border-pine-200 rounded-xl cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap flex-1">
                                            <MapPin size={18} className="text-pine-400 flex-shrink-0" />
                                            {selectedLocations.length === 0 ? (
                                                <span className="text-pine-400">點擊選擇面交地點...</span>
                                            ) : (
                                                <span className="text-pine-800">{selectedLocations.join('、')}</span>
                                            )}
                                        </div>
                                        {showLocationPicker ? <ChevronUp size={18} className="text-pine-400" /> : <ChevronDown size={18} className="text-pine-400" />}
                                    </div>
                                    {showLocationPicker && (
                                        <div className="mt-2 border border-pine-200 rounded-xl bg-white max-h-48 overflow-y-auto">
                                            {meetingPointCategories.map((cat) => (
                                                <div key={cat.name} className="border-b border-pine-100 last:border-b-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleLocationCategory(cat.name)}
                                                        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-cream-50"
                                                    >
                                                        <span className="font-medium text-pine-700 text-sm">{cat.name}</span>
                                                        {expandedLocationCategories[cat.name] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                    {expandedLocationCategories[cat.name] && (
                                                        <div className="px-4 pb-2 grid grid-cols-2 gap-1">
                                                            {cat.locations.map((loc) => (
                                                                <label
                                                                    key={loc}
                                                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer text-xs ${selectedLocations.includes(loc)
                                                                            ? 'bg-forest-100 text-forest-800'
                                                                            : 'bg-cream-50 text-pine-600 hover:bg-cream-100'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLocations.includes(loc)}
                                                                        onChange={() => toggleLocation(loc)}
                                                                        className="sr-only"
                                                                    />
                                                                    <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${selectedLocations.includes(loc)
                                                                            ? 'bg-forest-600 border-forest-600'
                                                                            : 'border-pine-300'
                                                                        }`}>
                                                                        {selectedLocations.includes(loc) && <CheckCircle size={8} className="text-white" />}
                                                                    </div>
                                                                    <span className="truncate">{loc}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-pine-400 text-xs mt-1">可選擇多個地點</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                {showDeleteConfirm ? (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <p className="text-red-700 text-sm mb-3">確定要刪除此商品嗎？此操作無法復原。</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 py-2 border border-pine-200 rounded-xl text-pine-600 hover:bg-pine-50"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={confirmDelete}
                                                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                                            >
                                                確定刪除
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
                                        >
                                            刪除
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="w-full py-3 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition font-medium"
                                        >
                                            儲存
                                        </button>
                                        <button
                                            onClick={handleReserveToggle}
                                            className="w-full py-3 bg-pine-700 text-white rounded-xl hover:bg-pine-800 transition font-medium"
                                        >
                                            {editingProduct.reserved ? '取消保留' : '暫保留'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPage;
