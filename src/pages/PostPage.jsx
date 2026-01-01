import React from 'react';
import { Plus } from 'lucide-react';
import { categories } from '../data/mock';

const PostPage = () => (
    <div className="px-4 space-y-5 max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-light text-pine-900 py-6 tracking-wide">分享物品</h2>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-6 shadow-sm border border-pine-50">
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
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-pine-600 mb-3">分類</label>
                <select className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50">
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
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-pine-600 mb-3">狀況</label>
                    <select className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition bg-white/50">
                        <option>全新</option>
                        <option>二手</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-pine-600 mb-3">說明</label>
                <textarea
                    className="w-full p-3 border border-pine-200 rounded-2xl text-pine-800 focus:outline-none focus:border-forest-400 focus:ring-1 focus:ring-forest-200 transition resize-none bg-white/50"
                    rows="5"
                    placeholder="分享這件物品的故事..."
                ></textarea>
            </div>

            <button className="w-full bg-pine-800 text-white py-4 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.99]">
                發布
            </button>
        </div>
    </div>
);

export default PostPage;
