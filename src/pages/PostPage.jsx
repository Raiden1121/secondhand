import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Truck } from 'lucide-react';
import { categories, conditions, meetingPointCategories } from '../data/mock';
import ImageCropper from '../components/ImageCropper';
import heic2any from 'heic2any';
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
    const [category, setCategory] = useState('教科書與書籍');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('全新');
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [negotiable, setNegotiable] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [locationSearch, setLocationSearch] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [isConverting, setIsConverting] = useState(false);
    const fileInputRef = useRef(null);
    const locationPickerRef = useRef(null);

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

    const toggleCategory = (catName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catName]: !prev[catName]
        }));
    };

    const toggleLocation = (location) => {
        setSelectedLocations(prev =>
            prev.includes(location)
                ? prev.filter(l => l !== location)
                : [...prev, location]
        );
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = images.length + files.length;
        if (totalImages > 5) {
            showToast('error', '最多只能上傳 5 張照片');
            return;
        }

        setIsConverting(true);

        try {
            const processedFiles = [];

            for (const file of files) {
                // Check if file is HEIC/HEIF
                const isHeic = file.type === 'image/heic' ||
                    file.type === 'image/heif' ||
                    file.name.toLowerCase().endsWith('.heic') ||
                    file.name.toLowerCase().endsWith('.heif');

                if (isHeic) {
                    // Convert HEIC to JPEG
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.9
                    });

                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    const convertedFile = new File(
                        [blob],
                        file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
                        { type: 'image/jpeg' }
                    );

                    processedFiles.push(convertedFile);
                } else {
                    processedFiles.push(file);
                }
            }

            // Queue files for cropping
            if (processedFiles.length > 0) {
                setPendingFiles(processedFiles);
                setImageToCrop(URL.createObjectURL(processedFiles[0]));
                setShowCropper(true);
            }
        } catch (error) {
            console.error('Error processing images:', error);
            showToast('error', '圖片處理失敗，請重試');
        } finally {
            setIsConverting(false);
        }

        // Reset file input
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob) => {
        // Create file from blob
        const croppedFile = new File(
            [croppedBlob],
            `cropped_${Date.now()}.jpg`,
            { type: 'image/jpeg' }
        );

        // Add to images
        setImages(prev => [...prev, croppedFile]);
        setPreviews(prev => [...prev, URL.createObjectURL(croppedBlob)]);

        // Revoke the crop source URL
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
        }

        // Process next file in queue
        const remainingFiles = pendingFiles.slice(1);
        if (remainingFiles.length > 0) {
            setPendingFiles(remainingFiles);
            setImageToCrop(URL.createObjectURL(remainingFiles[0]));
        } else {
            // All done
            setShowCropper(false);
            setImageToCrop(null);
            setPendingFiles([]);
        }
    };

    const handleCancelCrop = () => {
        // Revoke current URL
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
        }

        // Skip current and process next, or close if no more
        const remainingFiles = pendingFiles.slice(1);
        if (remainingFiles.length > 0) {
            setPendingFiles(remainingFiles);
            setImageToCrop(URL.createObjectURL(remainingFiles[0]));
        } else {
            setShowCropper(false);
            setImageToCrop(null);
            setPendingFiles([]);
        }
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
        if (!deliveryMethod) newErrors.deliveryMethod = '請選擇至少一種交易方式';
        if (deliveryMethod.includes('面交') && selectedLocations.length === 0) newErrors.location = '請選擇至少一個面交地點';
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
            formData.append('deliveryMethod', deliveryMethod);
            formData.append('negotiable', negotiable);
            formData.append('description', description.trim());
            formData.append('location', selectedLocations.join('、'));

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
                setSelectedLocations([]);
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
                        accept="image/*,.heic,.heif"
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
                                        onClick={() => !isConverting && fileInputRef.current?.click()}
                                        className={`aspect-square border-2 border-dashed border-pine-200 rounded-xl flex flex-col items-center justify-center transition group ${isConverting
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-cream-50 cursor-pointer'
                                            }`}
                                    >
                                        {isConverting ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-pine-300 border-t-pine-600 rounded-full animate-spin" />
                                                <p className="text-pine-400 mt-1 text-xs">處理中...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={24} className="text-pine-300 group-hover:text-pine-500 transition" />
                                                <p className="text-pine-400 mt-1 text-xs group-hover:text-pine-600">
                                                    {previews.length === 0 ? '上傳照片' : '新增'}
                                                </p>
                                            </>
                                        )}
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
                            {conditions.map(cond => (
                                <option key={cond} value={cond}>{cond}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Delivery Method & Negotiable */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-pine-600 mb-3">
                            交易方式 <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={deliveryMethod.includes('面交')}
                                    onChange={(e) => {
                                        const hasShipping = deliveryMethod.includes('寄送');
                                        if (e.target.checked) {
                                            setDeliveryMethod(hasShipping ? '面交、寄送' : '面交');
                                        } else if (hasShipping) {
                                            setDeliveryMethod('寄送');
                                        } else {
                                            setDeliveryMethod('');
                                        }
                                    }}
                                    className="w-4 h-4 text-forest-600 rounded border-pine-300 focus:ring-forest-500"
                                />
                                <span className="text-pine-700">面交</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={deliveryMethod.includes('寄送')}
                                    onChange={(e) => {
                                        const hasMeetup = deliveryMethod.includes('面交');
                                        if (e.target.checked) {
                                            setDeliveryMethod(hasMeetup ? '面交、寄送' : '寄送');
                                        } else if (hasMeetup) {
                                            setDeliveryMethod('面交');
                                        } else {
                                            setDeliveryMethod('');
                                        }
                                    }}
                                    className="w-4 h-4 text-forest-600 rounded border-pine-300 focus:ring-forest-500"
                                />
                                <span className="text-pine-700">寄送</span>
                            </label>
                        </div>
                        {errors.deliveryMethod && <p className="text-red-500 text-sm mt-1">{errors.deliveryMethod}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-pine-600 mb-3">
                            價格屬性
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setNegotiable(false)}
                                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition ${!negotiable ? 'bg-forest-600 text-white' : 'bg-pine-100 text-pine-600 hover:bg-pine-200'}`}
                            >
                                不議價
                            </button>
                            <button
                                type="button"
                                onClick={() => setNegotiable(true)}
                                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition ${negotiable ? 'bg-forest-600 text-white' : 'bg-pine-100 text-pine-600 hover:bg-pine-200'}`}
                            >
                                可議價
                            </button>
                        </div>
                    </div>
                </div>

                {/* Location - Multi-select (only if 面交 selected) */}
                {deliveryMethod.includes('面交') && (
                    <div ref={locationPickerRef}>
                        <label className="block text-sm font-medium text-pine-600 mb-3">
                            建議面交地點 <span className="text-red-500">*</span>
                        </label>

                        {/* Selected Locations Display */}
                        <div
                            onClick={() => setShowLocationPicker(!showLocationPicker)}
                            className={`w-full p-3 border rounded-2xl text-pine-800 focus:outline-none transition bg-white/50 cursor-pointer flex items-center justify-between ${errors.location ? 'border-red-300' : 'border-pine-200'} ${showLocationPicker ? 'border-forest-400 ring-1 ring-forest-200' : ''}`}
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

                        {/* Location Picker Dropdown */}
                        {showLocationPicker && (
                            <div className="mt-2 border border-pine-200 rounded-2xl bg-white shadow-lg max-h-80 overflow-hidden flex flex-col">
                                {/* Search Input */}
                                <div className="p-2 border-b border-pine-100">
                                    <input
                                        type="text"
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        placeholder="搜尋地點..."
                                        className="w-full px-3 py-2 border border-pine-200 rounded-xl text-sm focus:outline-none focus:border-forest-400"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    {meetingPointCategories
                                        .filter(cat => !locationSearch || cat.name.toLowerCase().includes(locationSearch.toLowerCase()) || cat.locations.some(loc => loc.toLowerCase().includes(locationSearch.toLowerCase())))
                                        .map((cat) => (
                                            <div key={cat.name} className="border-b border-pine-100 last:border-b-0">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.name)}
                                                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cream-50 transition"
                                                >
                                                    <span className="font-medium text-pine-700">{cat.name}</span>
                                                    {expandedCategories[cat.name] ? <ChevronUp size={16} className="text-pine-400" /> : <ChevronDown size={16} className="text-pine-400" />}
                                                </button>
                                                {(expandedCategories[cat.name] || locationSearch) && (
                                                    <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                                                        {cat.locations
                                                            .filter(loc => !locationSearch || loc.toLowerCase().includes(locationSearch.toLowerCase()))
                                                            .map((loc) => (
                                                                <label
                                                                    key={loc}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition text-sm ${selectedLocations.includes(loc)
                                                                        ? 'bg-forest-100 text-forest-800 border border-forest-300'
                                                                        : 'bg-cream-50 text-pine-600 hover:bg-cream-100 border border-transparent'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLocations.includes(loc)}
                                                                        onChange={() => toggleLocation(loc)}
                                                                        className="sr-only"
                                                                    />
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedLocations.includes(loc)
                                                                        ? 'bg-forest-600 border-forest-600'
                                                                        : 'border-pine-300'
                                                                        }`}>
                                                                        {selectedLocations.includes(loc) && (
                                                                            <CheckCircle size={12} className="text-white" />
                                                                        )}
                                                                    </div>
                                                                    <span className="truncate">{loc}</span>
                                                                </label>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        <p className="text-pine-400 text-xs mt-2">可選擇多個地點</p>
                    </div>
                )}

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
                </div >

                {/* Submit Button */}
                < button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-medium transition shadow-md hover:shadow-lg transform active:scale-[0.99] ${loading
                        ? 'bg-pine-400 text-white cursor-not-allowed'
                        : 'bg-pine-800 text-white hover:bg-pine-700'
                        }`}
                >
                    {loading ? '發布中...' : '發布'}
                </button >
            </div >

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            {/* Image Cropper Modal */}
            {
                showCropper && imageToCrop && (
                    <ImageCropper
                        imageSrc={imageToCrop}
                        onCancel={handleCancelCrop}
                        onCropComplete={handleCropComplete}
                        shape="square"
                        title={`調整照片 (${images.length + 1}/${images.length + pendingFiles.length})`}
                    />
                )
            }
        </div >
    );
};

export default PostPage;
