import React from 'react';
import { ArrowRight, BookOpen, Camera, MessageCircle, HandHeart } from 'lucide-react';
import pineLan from '../assets/pineLan.png';
import pineHand from '../assets/pineHand2Hand.png';

const LandingPage = ({ onNavigateToLogin, isAuthenticated, onNavigateToHome, onNavigateToPost }) => {

    const handleStart = () => {
        if (isAuthenticated) {
            onNavigateToHome();
        } else {
            onNavigateToLogin();
        }
    };

    const handleShare = () => {
        if (isAuthenticated) {
            onNavigateToPost();
        } else {
            onNavigateToLogin();
        }
    };

    return (
        <div className="bg-transparent bg-forest-50/30 text-pine-900 font-sans">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-semibold text-pine-900 leading-tight">
                        讓舊物<br />
                        <span className="font-bold text-forest-700">延續</span> 新的故事
                    </h1>
                    <p className="text-lg text-pine-600/80 leading-relaxed max-w-lg mx-auto md:mx-0">
                        中央大學專屬的二手物品交流平台。
                        <br className="hidden md:block" />
                        在這裡，每一次的交手，都是一次溫暖的傳遞。
                    </p>
                    <div className="md:hidden relative my-8">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-forest-100/50 rounded-full blur-3xl -z-10"></div>
                        <img
                            src={pineLan}
                            alt="Mascot"
                            className="w-full max-w-xs mx-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
                        />
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button
                            onClick={handleStart}
                            className="px-8 py-4 bg-forest-600 text-white rounded-2xl font-medium hover:bg-forest-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            開始尋寶 <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-8 py-4 bg-white text-pine-800 border-2 border-pine-100 rounded-2xl font-medium hover:bg-cream-50 transition flex items-center justify-center gap-2"
                        >
                            分享好物
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative hidden md:block">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-forest-100/50 rounded-full blur-3xl -z-10"></div>
                    <img
                        src={pineLan}
                        alt="Mascot"
                        className="w-full max-w-md mx-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
                    />
                </div>
            </div>

            {/* 流程介紹 */}
            <div className="bg-white/60 backdrop-blur-md py-20 px-6 mt-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-light text-center text-pine-800 mb-16">簡易流程，輕鬆上手</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* 賣家流程 */}
                        <div className="space-y-8 p-8 bg-white/80 rounded-3xl border border-pine-50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">賣家</span>
                                <h3 className="text-xl font-medium text-pine-800">如何分享物品？</h3>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">1</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <Camera size={18} /> 拍攝照片
                                    </h4>
                                    <p className="text-sm text-pine-600">為你的物品拍幾張漂亮的照片，展現它的真實狀況。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">2</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <BookOpen size={18} /> 填寫資訊
                                    </h4>
                                    <p className="text-sm text-pine-600">簡單描述物品的故事、價格與分類，設定方便的面交地點。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">3</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <HandHeart size={18} /> 傳遞交手
                                    </h4>
                                    <p className="text-sm text-pine-600">與買家在校園內面交，親手將物品傳遞給下一個主人。</p>
                                </div>
                            </div>
                        </div>

                        {/* 買家流程 */}
                        <div className="space-y-8 p-8 bg-white/80 rounded-3xl border border-pine-50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-forest-100 text-forest-700 px-4 py-1.5 rounded-full text-sm font-medium">買家</span>
                                <h3 className="text-xl font-medium text-pine-800">如何尋找寶物？</h3>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">1</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <BookOpen size={18} /> 瀏覽搜尋
                                    </h4>
                                    <p className="text-sm text-pine-600">透過分類或關鍵字，在校園內尋找你需要的教科書或生活用品。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">2</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <MessageCircle size={18} /> 開啟對話
                                    </h4>
                                    <p className="text-sm text-pine-600">對心儀的物品感興趣嗎？直接私訊賣家詢問細節。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">3</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <HandHeart size={18} className="scale-x-[-1]" /> 面交取貨
                                    </h4>
                                    <p className="text-sm text-pine-600">約定好時間地點，在熟悉的校園角落完成交易。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 特色/關於我們 */}
            <div className="py-20 px-6 max-w-7xl mx-auto text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-12 bg-forest-900 rounded-3xl p-8 md:p-16 text-forest-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex-1 space-y-6 relative z-10">
                        <h2 className="text-3xl font-light">關於松手傳遞</h2>
                        <p className="text-forest-200 leading-relaxed">
                            我們是中央大學的學生開發團隊。希望能透過這個平台，讓畢業學長姐帶不走的二手物品，
                            能夠便利地流轉到需要的學弟妹手中。減少浪費，不僅是環保，更是一種情感的延續。
                        </p>
                        {/* <div className="pt-4 grid grid-cols-3 gap-8 text-center border-t border-forest-800 mt-8">
                            <div>
                                <div className="text-2xl font-bold text-white">500+</div>
                                <div className="text-xs text-forest-300 mt-1">上架物品</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">1.2k</div>
                                <div className="text-xs text-forest-300 mt-1">成功交易</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">NCU</div>
                                <div className="text-xs text-forest-300 mt-1">校園專屬</div>
                            </div>
                        </div> */}
                    </div>
                    <div className="flex-1 hidden md:block relative z-10">
                        <img src="../src/assets/pineHand2Hand.png" alt="pineBack" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white/50 py-12 border-t border-pine-100">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-pine-800 font-medium flex items-center gap-2">
                        © 2026 松手傳遞
                        <span className="text-pine-400 text-xs font-normal ml-2">中央大學二手交易平台</span>
                    </div>
                    <div className="flex gap-6 text-sm text-pine-600">
                        <a href="#" className="hover:text-pine-900 transition">使用條款</a>
                        <a href="#" className="hover:text-pine-900 transition">隱私政策</a>
                        <a href="#" className="hover:text-pine-900 transition">聯絡我們</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
