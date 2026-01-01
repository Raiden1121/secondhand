import React from 'react';

const ProductCard = ({ product, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition group border border-pine-50 hover:border-pine-100"
        >
            <div className="aspect-square bg-cream-50 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-105 transition">
                {product.image}
            </div>
            <div className="p-3 md:p-4">
                <h3 className="font-medium text-pine-900 truncate text-sm md:text-base">{product.title}</h3>
                <p className="text-xs text-pine-500 mt-1">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-base md:text-lg font-semibold text-pine-800">NT$ {product.price}</span>
                    <span className="text-xs text-pine-400">{product.condition}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
