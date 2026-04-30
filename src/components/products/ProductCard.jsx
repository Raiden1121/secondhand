import React from 'react';
import { Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product, onClick, isOwner, onEdit }) => {
    const { t } = useTranslation();

    // Handle both API format (images array/string) and mock format (image emoji)
    const getImage = () => {
        if (product.image) return product.image; // Mock data emoji

        // API data: images could be JSON string or array
        let images = product.images;
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch {
                images = [];
            }
        }

        if (images && images.length > 0) {
            let imgUrl = images[0];
            if (imgUrl.startsWith('/uploads/')) {
                imgUrl = `${import.meta.env.VITE_API_URL}${imgUrl}`;
            }
            return (
                <img
                    src={imgUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                />
            );
        }

        return '📦'; // Default placeholder
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(product);
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition group border border-pine-50 hover:border-pine-100 relative"
        >
            <div className="aspect-square bg-cream-50 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-105 transition overflow-hidden relative">
                {getImage()}
                {product.carbonSaved > 0 && (
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-emerald-100/50 z-10">
                        <span>🌱</span>
                        <span>-{product.carbonSaved}kg</span>
                    </div>
                )}
                {isOwner && (
                    <button
                        onClick={handleEditClick}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-pine-600 rounded-full flex items-center justify-center hover:bg-forest-500 hover:text-white transition shadow-md z-10"
                        title={t('product.edit')}
                    >
                        <Edit3 size={16} />
                    </button>
                )}
            </div>
            <div className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-pine-900 truncate text-sm md:text-base flex-1">{product.title}</h3>
                    <span className="text-xs text-pine-700 flex-shrink-0 ml-2">{product.condition === '全新' ? t('product.new', { defaultValue: 'New' }) : (product.condition || (product.status === 'active' ? t('product.selling') : t('product.sold')))}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-pine-500">{t(`categories.${product.category}`, { defaultValue: product.category })}</p>
                    {product.deliveryMethod?.includes('寄送') && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">{t('product.shippable')}</span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base md:text-lg font-semibold text-pine-800">NT$ {product.price?.toLocaleString?.() || product.price}</span>
                        <span className="text-xs text-pine-400 font-light">{product.negotiable ? t('product.negotiable') : t('product.not_negotiable')}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${product.reserved
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                        }`}>
                        {product.reserved ? t('product.reserved') : t('product.available')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
