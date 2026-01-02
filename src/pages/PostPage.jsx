import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { categories } from '../data/mock';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePhoto = ({ url, index, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative aspect-square rounded-xl overflow-hidden border border-pine-200 bg-cream-50 touch-none group"
        >
            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
            >
                <X size={14} />
            </button>
        </div>
    );
};

const PostPage = ({ setCurrentPage }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('3C');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('全新');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = images.length + files.length;
        if (totalImages > 5) {
            showToast('error', '最多只能上傳 5 張照片');
            return;
        }

        // Use URL.createObjectURL for immediate preview
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);

        // Reset file input so the same file can be selected again
        e.target.value = '';
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};

        if (images.length === 0) newErrors.images = '請上傳至少一張照片';
        if (!title.trim()) newErrors.title = '請輸入物品名稱';
        if (!price || parseInt(price) < 0) newErrors.price = '請輸入有效價格';
        if (!location.trim()) newErrors.location = '請輸入面交地點';
        if (!description.trim()) newErrors.description = '請輸入物品說明';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = previews.indexOf(active.id);
            const newIndex = previews.indexOf(over.id);

            setPreviews((items) => arrayMove(items, oldIndex, newIndex));
            setImages((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', '請先登入');
            if (setCurrentPage) setCurrentPage('login');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('category', category);
            formData.append('price', parseInt(price));
            formData.append('condition', condition);
            formData.append('description', description.trim());
            formData.append('location', location.trim());

            images.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                showToast('success', '發布成功！');
                setTitle('');
                setCategory('3C');
                setPrice('');
                setCondition('全新');
                setDescription('');
                setLocation('');
                previews.forEach(url => URL.revokeObjectURL(url));
                setImages([]);
                setPreviews([]);
                setErrors({});
                setTimeout(() => {
                    if (setCurrentPage) setCurrentPage('home');
                }, 1500);
            } else {
                const err = await response.json();
                showToast('error', err.message || '發布失敗，請稍後再試');
            }
        } catch (error) {
            console.error('Error posting product:', error);
            showToast('error', '系統錯誤，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 space-y-5 max-w-2xl mx-auto pb-8 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-forest-600 text-white' : 'bg-red-500 text-white'
                    }`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <h2 className="text-2xl md:text-3xl font-light text-pine-900 py-6 tracking-wide">分享物品</h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-6 shadow-sm border border-pine-50">

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">
                        照片 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={previews} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {previews.map((preview, index) => (
                                    <SortablePhoto
                                        key={preview}
                                        url={preview}
                                        index={index}
                                        onRemove={removeImage}
                                    />
                                ))}

                                {previews.length < 5 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-pine-200 rounded-xl flex flex-col items-center justify-center hover:bg-cream-50 cursor-pointer transition group"
                                    >
                                        <Plus size={24} className="text-pine-300 group-hover:text-pine-500 transition" />
                                        <p className="text-pine-400 mt-1 text-xs group-hover:text-pine-600">
                                            {previews.length === 0 ? '上傳照片' : '新增'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
                    <p className="text-pine-400 text-xs mt-2">最多 5 張照片</p>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">
                        名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full p-3 border rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50 ${errors.title ? 'border-red-300' : 'border-pine-200'}`}
                        placeholder="給物品一個名字"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">
                        分類 <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                    >
                        {categories.filter(c => c !== '全部').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Price & Condition */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-pine-600 mb-3">
                            價格 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pine-400">NT$</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                className={`w-full pl-12 pr-3 py-3 border rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50 ${errors.price ? 'border-red-300' : 'border-pine-200'}`}
                                placeholder="0"
                            />
                        </div>
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-pine-600 mb-3">
                            狀況 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                        >
                            <option value="全新">全新</option>
                            <option value="九成新">九成新</option>
                            <option value="八成新">八成新</option>
                            <option value="七成新">七成新</option>
                            <option value="二手">二手</option>
                        </select>
                    </div>
                </div>

                {/* Location - REQUIRED */}
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">
                        建議面交地點 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={`w-full p-3 border rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50 ${errors.location ? 'border-red-300' : 'border-pine-200'}`}
                        placeholder="例如：中大湖、圖書館"
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">
                        說明 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full p-3 border rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition resize-none bg-white/50 ${errors.description ? 'border-red-300' : 'border-pine-200'}`}
                        rows="5"
                        placeholder="分享這件物品的故事..."
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-medium transition shadow-md hover:shadow-lg transform active:scale-[0.99] ${loading
                        ? 'bg-pine-400 text-white cursor-not-allowed'
                        : 'bg-pine-800 text-white hover:bg-pine-700'
                        }`}
                >
                    {loading ? '發布中...' : '發布'}
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PostPage;
