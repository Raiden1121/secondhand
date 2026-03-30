import React from 'react';
import { ArrowRight, BookOpen, Camera, MessageCircle, HandHeart } from 'lucide-react';
import pineLan from '../assets/pineLan.webp';
import pineBack from '../assets/pineBack.webp';
import { useTranslation } from 'react-i18next';

const LandingPage = ({ onNavigateToLogin, isAuthenticated, onNavigateToHome, onNavigateToPost }) => {
    const { t } = useTranslation();

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
                        {t('landing.slogan_p1')}<br />
                        <span className="font-bold text-forest-700">{t('landing.slogan_p2')}</span> {t('landing.slogan_p3')}
                    </h1>
                    <p className="text-lg text-pine-600/80 leading-relaxed max-w-lg mx-auto md:mx-0">
                        {t('landing.desc_p1')}
                        <br className="hidden md:block" />
                        {t('landing.desc_p2')}
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
                            {t('landing.start_hunt')} <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-8 py-4 bg-white text-pine-800 border-2 border-pine-100 rounded-2xl font-medium hover:bg-cream-50 transition flex items-center justify-center gap-2"
                        >
                            {t('landing.share_items')}
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
                    <h2 className="text-3xl font-light text-center text-pine-800 mb-16">{t('landing.easy_process')}</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* 賣家流程 */}
                        <div className="space-y-8 p-8 bg-white/80 rounded-3xl border border-pine-50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">{t('landing.seller')}</span>
                                <h3 className="text-xl font-medium text-pine-800">{t('landing.how_to_share')}</h3>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">1</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <Camera size={18} /> {t('landing.take_photo')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.take_photo_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">2</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <BookOpen size={18} /> {t('landing.fill_info')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.fill_info_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">3</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <HandHeart size={18} /> {t('landing.handover')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.handover_desc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* 買家流程 */}
                        <div className="space-y-8 p-8 bg-white/80 rounded-3xl border border-pine-50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-forest-100 text-forest-700 px-4 py-1.5 rounded-full text-sm font-medium">{t('landing.buyer')}</span>
                                <h3 className="text-xl font-medium text-pine-800">{t('landing.how_to_find')}</h3>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">1</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <BookOpen size={18} /> {t('landing.browse_search')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.browse_search_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">2</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <MessageCircle size={18} /> {t('landing.start_chat')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.start_chat_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-pine-600 flex-shrink-0 mt-1">3</div>
                                <div>
                                    <h4 className="font-medium text-pine-800 mb-1 flex items-center gap-2">
                                        <HandHeart size={18} className="scale-x-[-1]" /> {t('landing.meet_pickup')}
                                    </h4>
                                    <p className="text-sm text-pine-600">{t('landing.meet_pickup_desc')}</p>
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
                        <h2 className="text-3xl font-light">{t('landing.about_title')}</h2>
                        <p className="text-forest-200 leading-relaxed">
                            {t('landing.about_desc')}
                        </p>
                    </div>
                    <div className="flex-1 hidden md:block relative z-10">
                        <img src={pineBack} alt="pineBack" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white/50 py-12 border-t border-pine-100">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-pine-800 font-medium flex items-center gap-2">
                        {t('landing.footer_rights')}
                        <span className="text-pine-400 text-xs font-normal ml-2">{t('landing.footer_sub')}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
