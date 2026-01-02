import React, { useState } from 'react';
import { Star, Package, Plus, X, User, Mail, IdCard, ArrowRight } from 'lucide-react';
import { categories } from '../data/mock';
import pineLan from '../assets/pineLan.png';
import pineLogo from '../assets/pineLogo.png';

const ProfilePage = ({ user, onLogout }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '3C',
        price: 0,
        condition: '全新',
        description: ''
    });

    // 模擬的商品資料（之後從 API 取得）
    const [products, setProducts] = useState([
        { id: 1, title: 'iPhone 13 Pro', price: 18000, category: '3C', condition: '二手', description: '九成新', image: '📱' },
        { id: 2, title: 'iPhone 13 Pro', price: 18000, category: '3C', condition: '二手', description: '九成新', image: '📱' },
    ]);

    const handleEdit = (product) => {
        setFormData({
            title: product.title,
            category: product.category,
            price: product.price,
            condition: product.condition,
            description: product.description
        });
        setEditingProduct(product);
    };

    const handleClose = () => {
        setEditingProduct(null);
    };

    const handleSave = () => {
        // 更新商品資料
        setProducts(prev => prev.map(p =>
            p.id === editingProduct.id
                ? { ...p, ...formData }
                : p
        ));
        setEditingProduct(null);
        // TODO: 呼叫 API 更新
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
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profileFormData.name,
                    department: profileFormData.department,
                    phone: profileFormData.phone,
                    gender: profileFormData.gender,
                }),
            });

            if (response.ok) {
                // Refresh logic
                window.location.reload();
            } else {
                alert('更新失敗');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('更新發生錯誤');
        }
        setIsEditingProfile(false);
    };

    const handleDelete = () => {
        if (window.confirm('確定要刪除這個商品嗎？')) {
            setProducts(prev => prev.filter(p => p.id !== editingProduct.id));
            setEditingProduct(null);
            // TODO: 呼叫 API 刪除
        }
    };

    return (
        <div className="px-4 space-y-5 max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 mt-6 border border-pine-50 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-cream-100 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-4 border-white shadow-sm">
                        {user?.avatar || '👤'}
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
                    {products.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-4 border border-pine-100 rounded-xl hover:bg-cream-50 transition cursor-pointer">
                            <div className="w-16 h-16 bg-cream-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-pine-600">
                                {product.image}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-pine-900 truncate">{product.title}</h4>
                                <p className="text-sm text-pine-500 mt-1">NT$ {product.price.toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => handleEdit(product)}
                                className="text-sm text-pine-600 hover:text-pine-800 flex-shrink-0 hover:underline"
                            >
                                編輯
                            </button>
                        </div>
                    ))}
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
                            <h2 className="text-xl font-light text-pine-900">編輯物品</h2>
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
                                <div className="border-2 border-dashed border-pine-200 rounded-2xl p-12 text-center hover:bg-cream-50 cursor-pointer transition group">
                                    <Plus size={40} className="mx-auto text-pine-300 group-hover:text-pine-500 transition" />
                                    <p className="text-pine-400 mt-3 text-sm group-hover:text-pine-600">上傳物品照片</p>
                                </div>
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
                                onClick={handleSave}
                                className="flex-1 bg-pine-800 text-white py-4 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                保留
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-medium hover:bg-red-600 transition shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                刪除
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

                                {/* Name Field */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#5C4033] mb-2">
                                        <User size={18} className="text-[#8B5A2B]" />
                                        姓名
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-[#8B5A2B] focus:ring-4 focus:ring-[#8B5A2B]/10 transition-all duration-200 placeholder:text-stone-300"
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
                                    <label className="block text-sm font-semibold text-[#5C4033] mb-2">系所</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:border-[#8B5A2B] focus:ring-4 focus:ring-[#8B5A2B]/10 transition-all duration-200 cursor-pointer hover:border-[#8B5A2B]/50 appearance-none"
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
                                        className="w-full bg-[#5C4033] text-white py-4 rounded-xl font-medium tracking-wide hover:bg-[#4A332A] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md flex items-center justify-center gap-2 group"
                                    >
                                        <span>儲存變更</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

