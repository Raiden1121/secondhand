import React from 'react';
import { Star, Package } from 'lucide-react';

const ProfilePage = ({ onLogout }) => (
    <div className="px-4 space-y-5 max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 mt-6 border border-pine-50 shadow-sm">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-cream-100 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-4 border-white shadow-sm">
                    👤
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-light text-pine-900">資工系 王同學</h2>
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
                {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-pine-100 rounded-xl hover:bg-cream-50 transition cursor-pointer">
                        <div className="w-16 h-16 bg-cream-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-pine-600">
                            📱
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-pine-900 truncate">iPhone 13 Pro</h4>
                            <p className="text-sm text-pine-500 mt-1">NT$ 18,000</p>
                        </div>
                        <button className="text-sm text-pine-600 hover:text-pine-800 flex-shrink-0 hover:underline">編輯</button>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-pine-50 shadow-sm">
            <button className="w-full text-left p-5 hover:bg-cream-50 transition text-pine-800 border-b border-pine-100/50">
                我的評價
            </button>
            <button className="w-full text-left p-5 hover:bg-cream-50 transition text-pine-800 border-b border-pine-100/50">
                帳號設定
            </button>
            <button
                onClick={onLogout}
                className="w-full text-left p-5 hover:bg-red-50 transition text-red-600/80 hover:text-red-700">
                登出
            </button>
        </div>
    </div>
);

export default ProfilePage;
