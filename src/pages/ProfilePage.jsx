import React, { useState, useEffect } from 'react';
import { Star, Package, Plus, X, User, Mail, IdCard, ArrowRight, AlertTriangle, Heart, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { categories } from '../data/mock';
import pineLan from '../assets/pineLan.png';
import pineLogo from '../assets/pineLogo.png';
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

const SortablePhoto = ({ id, url, index, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

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
                onClick={() => onRemove(id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
            >
                <X size={14} />
            </button>
        </div>
    );
};

const ProfilePage = ({ user, onLogout, setCurrentPage, onNavigateToProduct, onUserUpdate }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '3C',
        price: 0,
        condition: '全新',
        description: ''
    });

    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [toast, setToast] = useState(null);
    const [isToastExiting, setIsToastExiting] = useState(false);

    // Toast Timer and Animation
    useEffect(() => {
        if (toast) {
            setIsToastExiting(false);
            const timer = setTimeout(() => {
                setIsToastExiting(true);
                setTimeout(() => {
                    setToast(null);
                    setIsToastExiting(false);
                }, 450);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type, message) => {
        setToast({ type, message });
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

    useEffect(() => {
        const fetchMyProducts = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:3000/api/products/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Error fetching my products:', error);
            }
        };

        const fetchFavorites = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:3000/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchMyProducts();
        fetchFavorites();
    }, []);

    const getProductImage = (product) => {
        let images = product.images;
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = []; }
        }

        if (images && images.length > 0) {
            return (
                <img
                    src={`http://localhost:3000${images[0]}`}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl"
                />
            );
        }
        return '📦';
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('/uploads/')) {
            return `http://localhost:3000${avatar}`;
        }
        // Check if it's a blob url (preview) or full http URL
        if (avatar.startsWith('blob:') || avatar.startsWith('http')) {
            return avatar;
        }
        return null; // For emoji or text, handle in render
    };

    const renderAvatar = (avatarUrl, sizeClass = "w-20 h-20 md:w-24 md:h-24", textSize = "text-4xl") => {
        const url = getAvatarUrl(avatarUrl);
        if (url) {
            return <img src={url} alt="Avatar" className={`w-full h-full object-cover rounded-full`} />;
        }
        return <span className={textSize}>{avatarUrl || '👤'}</span>;
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (imageList.length + files.length > 5) {
            alert('最多只能上傳 5 張照片');
            return;
        }

        const newItems = files.map(file => {
            const url = URL.createObjectURL(file);
            return {
                id: url,
                type: 'new',
                url: url,
                file: file
            };
        });

        setImageList(prev => [...prev, ...newItems]);
        e.target.value = '';
    };

    const removeImage = (id) => {
        const item = imageList.find(i => i.id === id);
        if (item && item.type === 'new') {
            URL.revokeObjectURL(item.url);
        }
        setImageList(prev => prev.filter(i => i.id !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setImageList((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

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

    const handleSave = async () => {
        // Simple validation
        if (!formData.title || !formData.price || !formData.description) {
            alert('請填寫完整資訊');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Prepare FormData for file upload
            // Note: Since we need to handle updates with images properly, the backend needs to support it.
            // Currently backend updateProduct supports images array (paths). 
            // BUT here we have mixed existing (paths) and new (files).
            // This is tricky because backend update expects JSON body typically unless strictly multipart.
            // The route middleware is upload.array('images', 5).
            // So we should send FormData.

            // Existing images are paths. We should send them as text field? 
            // The backend updateProduct logic replaces images: 
            /*
             const { images } = req.body; // text field
             let imagePaths = [];
             if (req.files) ... add new paths
             // But we need to keep existing ones too.
             // We need backend to merge or we merge on frontend?
             // Since existingImages are string paths, we can send them.
            */

            // Wait, backend logic for update is simple replacement:
            /*
             images,
            */

            // If we use FormData, fields are strings.
            // New files are in req.files.

            // We need to modify backend logic to merge or handle this properly?
            // Let's implement frontend first properly for FormData.

            /*
              Strategy:
              1. Send existingImages as a JSON string in 'existingImages' field? Or just 'images'?
              2. Backend logic needs to check if images is provided.
            */

            // Let's check backend controller logic for update first.
            // It just updates with `images` from req.body.
            // But if we upload files, `images` in req.body might be overridden or empty?
            // Actually with multer, req.body has text fields.

            // Let's construct FormData
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('category', formData.category);
            submitData.append('price', parseInt(formData.price));
            submitData.append('condition', formData.condition);
            submitData.append('description', formData.description);
            submitData.append('location', editingProduct.location || ''); // Preserve location or add editable field later
            submitData.append('status', editingProduct.status);

            // Handle Images (Unified List)
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

            // Append existing images as a JSON string or individual fields?
            // Prisma expects 'images' to be a JSON string of paths.
            // If we send `images` as string of existing paths, multer won't touch it.
            // But we also have NEW files.

            // We need to modify Backend to merge. 
            // Let's assume for now we send existing paths as 'existingImages' and let backend handle it?
            // Or easier: we send 'images' as the JSON string of existing ones.
            // And 'newImages' as files? 
            // But Multer expects 'images' for files based on route config: `upload.array('images', 5)`

            // So files MUST be in 'images' field.
            // The existing image paths must be in a different field, say 'existingImages'.

            // Removed legacy existingImages

            // Removed legacy newImages

            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type header for FormData, browser sets it with boundary
                },
                body: submitData
            });

            if (response.ok) {
                const updatedProduct = await response.json();

                // Update local state
                setProducts(prev => prev.map(p =>
                    p.id === editingProduct.id ? updatedProduct : p
                ));
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

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        name: '',
        department: '',
        phone: '',
        gender: '',
        email: '',
        studentId: ''
    });

    // Avatar Upload State
    const [showCropper, setShowCropper] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const handleEditProfile = () => {
        if (!user) return;
        setProfileFormData({
            name: user.name || '',
            department: user.department || '',
            phone: user.phone || '',
            gender: user.gender || '',
            email: user.email || '',
            studentId: user.studentId || ''
        });
        setAvatarPreview(null);
        setAvatarFile(null);
        setIsEditingProfile(true);
    };

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0];

            // Basic validation
            if (!file.type.startsWith('image/')) {
                alert('請上傳圖片檔案');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('圖片大小不能超過 5MB');
                return;
            }

            // Convert HEIC to JPEG if needed
            if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
                try {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.9
                    });
                    // heic2any might return array of blobs or single blob
                    file = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                } catch (error) {
                    console.error('HEIC conversion error:', error);
                    alert('HEIC 圖片轉換失敗，請嘗試其他格式');
                    return;
                }
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedFile(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleCropComplete = (blob) => {
        if (isEditingProfile) {
            setAvatarFile(blob);
            setAvatarPreview(URL.createObjectURL(blob));
            setShowCropper(false);
            setSelectedFile(null);
        } else {
            // Direct upload mode
            uploadAvatar(blob);
            setShowCropper(false);
            setSelectedFile(null);
        }
    };

    const uploadAvatar = async (blob) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.jpg');
            // Preserve existing data
            formData.append('name', user.name || '');
            formData.append('department', user.department || '');
            formData.append('phone', user.phone || '');
            formData.append('gender', user.gender || '');

            const response = await fetch('http://localhost:3000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update avatar preview locally
                setAvatarPreview(updatedUser.avatar ? `http://localhost:3000${updatedUser.avatar}` : null);
                showToast('success', '頭像更新成功');
            } else {
                showToast('error', '頭像更新失敗');
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            showToast('error', '系統錯誤，請稍後再試');
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    // Check for mandatory fields on mount
    React.useEffect(() => {
        if (user) {
            if (!user.name || !user.department) {
                // Auto-open modal if fields are missing
                handleEditProfile();
            }
        }
    }, [user]);

    const handleSaveProfile = async () => {
        // Validation handled by button state, but double check here
        if (!profileFormData.name || !profileFormData.department) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', profileFormData.name);
            formData.append('department', profileFormData.department);
            formData.append('phone', profileFormData.phone || '');
            formData.append('gender', profileFormData.gender || '');

            if (avatarFile) {
                formData.append('avatar', avatarFile, 'avatar.jpg');
            }

            const response = await fetch('http://localhost:3000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update user state directly instead of reloading
                if (onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
                // Update local avatar preview
                if (updatedUser.avatar) {
                    setAvatarPreview(`http://localhost:3000${updatedUser.avatar}`);
                }
                showToast('success', '個人資料已更新');
                setIsEditingProfile(false);
            } else {
                alert('更新失敗');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('更新發生錯誤');
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    return (
        <div className="px-4 space-y-5 max-w-2xl mx-auto">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                    } ${isToastExiting ? 'animate-slide-up' : 'animate-slide-down'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 mt-6 border border-pine-50 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload-main').click()}>
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-cream-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm overflow-hidden group-hover:opacity-90 transition">
                            {renderAvatar(avatarPreview || user?.avatar)}
                        </div>
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white drop-shadow-md" size={24} />
                        </div>
                        <input
                            type="file"
                            id="avatar-upload-main"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-light text-pine-900">
                            {user?.name || '未知使用者'}
                        </h2>
                        <div className="flex items-center gap-1 mt-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <span className="font-medium text-pine-800">4.8</span>
                            <span className="text-sm text-pine-500 ml-1">(12 則評價)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pine-50 shadow-sm">
                <h3 className="font-medium text-pine-900 mb-4 flex items-center gap-2">
                    <Package size={18} />
                    我的物品
                </h3>
                <div className="space-y-3">
                    {products.length === 0 ? (
                        <p className="text-center text-pine-400 py-4 text-sm">目前沒有上架的物品</p>
                    ) : (
                        products.map(product => (
                            <div
                                key={product.id}
                                onClick={() => onNavigateToProduct ? onNavigateToProduct(product.id) : setCurrentPage(`product-${product.id}`)}
                                className="flex items-center gap-4 p-4 border border-pine-100 rounded-xl hover:bg-cream-50 transition cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-cream-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-pine-600 overflow-hidden">
                                    {getProductImage(product)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-pine-900 truncate">{product.title}</h4>
                                    <p className="text-sm text-pine-500 mt-1">NT$ {product.price?.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(product);
                                    }}
                                    className="text-sm text-white bg-pine-700 hover:bg-pine-800 px-4 py-2 rounded-lg flex-shrink-0 transition"
                                >
                                    編輯
                                </button>
                            </div>
                        )))}
                </div>
            </div>

            {/* My Favorites Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pine-50 shadow-sm">
                <h3 className="font-medium text-pine-900 mb-4 flex items-center gap-2">
                    <Heart size={18} className="text-red-400" />
                    我的收藏
                </h3>
                <div className="space-y-3">
                    {favorites.length === 0 ? (
                        <p className="text-center text-pine-400 py-4 text-sm">還沒有收藏任何物品</p>
                    ) : (
                        favorites.map(product => (
                            <div
                                key={product.id}
                                onClick={() => onNavigateToProduct ? onNavigateToProduct(product.id) : setCurrentPage(`product-${product.id}`)}
                                className="flex items-center gap-4 p-4 border border-pine-100 rounded-xl hover:bg-cream-50 transition cursor-pointer">
                                <div className="w-16 h-16 bg-cream-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-pine-600 overflow-hidden">
                                    {getProductImage(product)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-pine-900 truncate">{product.title}</h4>
                                    <p className="text-sm text-pine-500 mt-1">NT$ {product.price?.toLocaleString()}</p>
                                </div>
                                <span className="text-xs text-pine-400">
                                    {product.seller?.name}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-pine-50 shadow-sm">
                <button className="w-full text-left p-5 hover:bg-cream-50 transition text-pine-800 border-b border-pine-100/50">
                    我的評價
                </button>
                <button
                    onClick={handleEditProfile}
                    className="w-full text-left p-5 hover:bg-cream-50 transition text-pine-800 border-b border-pine-100/50">
                    帳號設定
                </button>
                <button
                    onClick={onLogout}
                    className="w-full text-left p-5 hover:bg-red-50 transition text-red-600/80 hover:text-red-700">
                    登出
                </button>
            </div>

            {/* 編輯商品 Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-pine-100">
                            <h2 className="text-xl font-medium text-pine-900">編輯物品</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-cream-50 rounded-full transition"
                            >
                                <X size={20} className="text-pine-600" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-pine-600 mb-3">照片</label>
                                <input
                                    type="file"
                                    id="edit-image-upload"
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
                                    <SortableContext items={imageList.map(i => i.id)} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-3 gap-3">
                                            {imageList.map((img, index) => (
                                                <SortablePhoto
                                                    key={img.id}
                                                    id={img.id}
                                                    url={img.url}
                                                    index={index}
                                                    onRemove={removeImage}
                                                />
                                            ))}

                                            {/* Upload Button */}
                                            {imageList.length < 5 && (
                                                <label
                                                    htmlFor="edit-image-upload"
                                                    className="aspect-square border-2 border-dashed border-pine-200 rounded-xl flex flex-col items-center justify-center hover:bg-cream-50 cursor-pointer transition group"
                                                >
                                                    <Plus size={24} className="text-pine-300 group-hover:text-pine-500 transition" />
                                                    <p className="text-pine-400 mt-1 text-xs group-hover:text-pine-600">
                                                        {imageList.length === 0 ? '上傳照片' : '新增'}
                                                    </p>
                                                </label>
                                            )}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pine-600 mb-3">名稱</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                                    placeholder="給物品一個名字"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pine-600 mb-3">分類</label>
                                <select
                                    className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== '全部').map(cat => (
                                        <option key={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-3">價格</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pine-400">NT$</span>
                                        <input
                                            type="number"
                                            className="w-full pl-12 pr-3 py-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-pine-600 mb-3">狀況</label>
                                    <select
                                        className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option>全新</option>
                                        <option>二手</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pine-600 mb-3">說明</label>
                                <textarea
                                    className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition resize-none bg-white/50"
                                    rows="4"
                                    placeholder="分享這件物品的故事..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 pt-0 flex gap-3">

                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-medium hover:bg-red-600 transition shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                刪除
                            </button>

                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-medium hover:bg-green-700 transition shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                儲存
                            </button>

                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}/reserve`, {
                                            method: 'PATCH',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        if (response.ok) {
                                            const updatedProduct = await response.json();
                                            setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
                                            setEditingProduct(null); // Close modal and return to profile
                                        }
                                    } catch (error) {
                                        console.error('Error toggling reserve:', error);
                                    }
                                }}
                                className="flex-1 bg-pine-800 text-white py-4 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                {editingProduct.reserved ? '取消保留' : '暫保留'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 編輯個人資料 Split Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[#FAF9F6] w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

                        {/* Left Side - Brown Theme & Mascot */}
                        <div className="w-full md:w-2/5 bg-[#5C4033] relative flex flex-col items-center justify-between p-8 overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-[#8D6E63] rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
                            <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-[#3E2723] rounded-full mix-blend-overlay blur-3xl opacity-30"></div>

                            {/* Logo Area */}
                            <div className="flex items-center gap-3 z-10 w-full">
                                <img src={pineLogo} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert opacity-90" />
                                <span className="text-white font-light tracking-widest text-sm opacity-90">NCU Hand Over</span>
                            </div>

                            {/* Center Text */}
                            <div className="text-center z-10 my-8 md:my-0">
                                <h2 className="text-3xl font-light text-white tracking-widest mb-2">帳號設定</h2>
                                <div className="w-12 h-1 bg-white/20 mx-auto rounded-full"></div>
                            </div>

                            {/* Mascot - Positioned at bottom */}
                            <div className="relative w-48 z-10 mt-auto transform hover:scale-105 transition-transform duration-500">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#8D6E63] rounded-full blur-2xl opacity-40"></div>
                                <img src={pineLan} alt="Mascot" className="relative w-full object-contain drop-shadow-xl transform scale-x-[-1]" />
                            </div>
                        </div>

                        {/* Right Side - Form Content */}
                        <div className="flex-1 relative bg-[#FAF9F6] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors z-20"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8 md:p-10 space-y-6">

                                {/* Warning Banner for Missing Fields */}
                                {(!user?.name || !user?.department) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start animate-fadeIn">
                                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-amber-900 text-sm mb-1">請完善個人資料</h4>
                                            <p className="text-sm text-amber-800/80 leading-relaxed">
                                                為了讓系統能根據您的「系所」進行準確的商品篩選與配對，請務必填寫姓名與系所資訊。
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Avatar Upload Section */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-28 h-28 rounded-full overflow-hidden bg-stone-200 border-4 border-white shadow-lg flex items-center justify-center">
                                            {renderAvatar(avatarPreview || user?.avatar, "w-full h-full", "text-5xl")}
                                        </div>
                                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="text-white" size={32} />
                                        </label>
                                        <div className="absolute bottom-0 right-0 bg-pine-600 text-white p-2 rounded-full border-2 border-white shadow-sm pointer-events-none">
                                            <Camera size={14} />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <p className="text-xs text-stone-500 mt-2">點擊更換頭像</p>
                                </div>

                                {/* Name Field */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#5C4033] mb-2">
                                        <User size={18} className="text-[#8B5A2B]" />
                                        姓名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${!profileFormData.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-stone-200 focus:border-[#8B5A2B] focus:ring-[#8B5A2B]/10'}`}
                                        placeholder="請輸入您的姓名"
                                        value={profileFormData.name}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                                    />
                                </div>

                                {/* Student ID & Email Group */}
                                <div className="space-y-4 bg-stone-100/50 p-4 rounded-xl border border-stone-100">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                                            <IdCard size={14} />
                                            學號 (唯讀)
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full bg-transparent border-b border-stone-200 py-2 text-stone-500 font-medium cursor-not-allowed focus:outline-none"
                                            value={profileFormData.studentId}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                                            <Mail size={14} />
                                            Email (唯讀)
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            className="w-full bg-transparent border-b border-stone-200 py-2 text-stone-500 font-medium cursor-not-allowed focus:outline-none"
                                            value={profileFormData.email}
                                        />
                                    </div>
                                </div>

                                {/* Department Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                                        系所 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-4 py-3 border rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-4 transition-all duration-200 cursor-pointer appearance-none ${!profileFormData.department ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-stone-200 focus:border-[#8B5A2B] hover:border-[#8B5A2B]/50 focus:ring-[#8B5A2B]/10'}`}
                                            value={profileFormData.department || ''}
                                            onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })}
                                        >
                                            <option value="">選擇系所</option>
                                            <option value="資工系">資工系</option>
                                            <option value="資管系">資管系</option>
                                            <option value="電機系">電機系</option>
                                            <option value="企管系">企管系</option>
                                            <option value="經濟系">經濟系</option>
                                            <option value="英文系">英文系</option>
                                            <option value="中文系">中文系</option>
                                            <option value="其他">其他</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone & Gender Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#5C4033] mb-2">電話</label>
                                        <input
                                            type="tel"
                                            placeholder="0912-345-678"
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-[#8B5A2B] focus:ring-4 focus:ring-[#8B5A2B]/10 transition-all duration-200 placeholder:text-stone-300"
                                            value={profileFormData.phone || ''}
                                            onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#5C4033] mb-2">性別</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-[#8B5A2B] focus:ring-4 focus:ring-[#8B5A2B]/10 transition-all duration-200 cursor-pointer hover:border-[#8B5A2B]/50 appearance-none"
                                                value={profileFormData.gender || ''}
                                                onChange={(e) => setProfileFormData({ ...profileFormData, gender: e.target.value })}
                                            >
                                                <option value="">選擇</option>
                                                <option value="male">男</option>
                                                <option value="female">女</option>
                                                <option value="other">其他</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={!profileFormData.name || !profileFormData.department}
                                        className={`w-full py-4 rounded-xl font-medium tracking-wide shadow-md flex items-center justify-center gap-2 group transition-all duration-200
                                            ${!profileFormData.name || !profileFormData.department
                                                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                                : 'bg-[#5C4033] text-white hover:bg-[#4A332A] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}`}
                                    >
                                        <span>儲存變更</span>
                                        {(!profileFormData.name || !profileFormData.department) ? null : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-pine-900">確定要刪除嗎？</h3>
                            <p className="text-sm text-pine-500 mt-2">此動作無法復原，商品將會被永久移除。</p>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-pine-200 text-pine-600 hover:bg-cream-50 transition"
                            >
                                考慮一下
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                            >
                                確認刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cropper Modal */}
            {showCropper && selectedFile && (
                <ImageCropper
                    imageSrc={selectedFile}
                    onCancel={handleCancelCrop}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};

export default ProfilePage;

