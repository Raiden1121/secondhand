import React from 'react';
import { Heart, Star, MapPin, Flag } from 'lucide-react';
import { mockProducts, meetingPoints } from '../data/mock';

const ProductDetailPage = ({ productId, setCurrentPage }) => {
    const product = mockProducts.find(p => p.id === parseInt(productId));
    if (!product) return <div>商品不存在</div>;

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-6 text-pine-600 hover:text-pine-800 text-sm flex items-center gap-1"
                >
                    ← 返回
                </button>

                <div className="bg-white rounded-t-3xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-cream-50 flex items-center justify-center text-9xl">
                        {product.image}
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h1 className="text-2xl md:text-3xl font-light text-pine-900 tracking-wide">{product.title}</h1>
                                <button className="p-2 hover:bg-cream-100 rounded-full transition">
                                    <Heart size={24} className="text-pine-400" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {product.category}
                                </span>
                                <span className="text-pine-500 text-xs">
                                    {product.condition}
                                </span>
                            </div>
                        </div>

                        <div className="text-3xl md:text-4xl font-light text-pine-800">
                            NT$ {product.price}
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3">賣家</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-pine-800 font-medium">{product.seller}</span>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-amber-500 fill-amber-500" />
                                    <span className="font-medium text-pine-700">{product.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3">關於這件物品</h3>
                            <p className="text-pine-700 leading-relaxed">
                                這是一件用心保養的物品，希望能找到懂得欣賞它的新主人。
                                物品狀況良好，功能正常。歡迎詢問更多細節，也歡迎約時間當面查看。
                            </p>
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-pine-400" />
                                建議見面地點
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {meetingPoints.map(point => (
                                    <span key={point} className="bg-forest-50 text-forest-700 px-3 py-1.5 rounded-full text-xs border border-forest-100">
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button className="flex-1 bg-pine-800 text-white py-4 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.98]">
                                開始對話
                            </button>
                            <button className="px-5 py-4 border border-pine-200 text-pine-600 rounded-2xl hover:bg-cream-50 transition">
                                <Flag size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
