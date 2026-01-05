import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, User } from 'lucide-react';

const RatingPage = ({ transactionId, setCurrentPage, user }) => {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [hoverScore, setHoverScore] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:3000/api/transactions/${transactionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTransaction(data);

                    // Check if user has already rated
                    const checkRating = await fetch(`http://localhost:3000/api/ratings/transaction/${transactionId}/status`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (checkRating.ok) {
                        const ratingData = await checkRating.json();
                        setHasRated(ratingData.hasRated);
                        if (ratingData.rating) {
                            setScore(ratingData.rating.score);
                        }
                    }
                } else {
                    setError('無法載入交易資訊');
                }
            } catch (err) {
                console.error('Error fetching transaction:', err);
                setError('載入失敗');
            } finally {
                setLoading(false);
            }
        };
        fetchTransaction();
    }, [transactionId]);

    const handleSubmit = async () => {
        if (score === 0) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/api/ratings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transactionId: parseInt(transactionId),
                    score,
                    comment: comment.trim() || null
                })
            });

            if (response.ok) {
                setHasRated(true);
            } else {
                const err = await response.json();
                setError(err.message || '評價失敗');
            }
        } catch (err) {
            console.error('Error submitting rating:', err);
            setError('評價失敗');
        } finally {
            setSubmitting(false);
        }
    };

    // Determine who we are rating
    const getRatedPerson = () => {
        if (!transaction || !user) return null;
        return user.id === transaction.buyerId ? transaction.seller : transaction.buyer;
    };

    const ratedPerson = getRatedPerson();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-2 border-pine-800 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error && !transaction) {
        return (
            <div className="px-4 py-6">
                <button onClick={() => setCurrentPage('notifications')} className="mb-4">
                    <ArrowLeft size={24} className="text-pine-600" />
                </button>
                <div className="text-center py-20 text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 max-w-md mx-auto">
            <button
                onClick={() => setCurrentPage('notifications')}
                className="mb-6 flex items-center gap-2 text-pine-600 hover:text-pine-800"
            >
                <ArrowLeft size={20} />
                返回
            </button>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pine-100">
                <h2 className="text-xl font-medium text-pine-900 mb-6 text-center">
                    {hasRated ? '感謝您的評價' : '評價交易對象'}
                </h2>

                {/* User being rated */}
                {ratedPerson && (
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-2 overflow-hidden">
                            {ratedPerson.avatar ? (
                                <img
                                    src={ratedPerson.avatar.startsWith('http') ? ratedPerson.avatar : `http://localhost:3000${ratedPerson.avatar}`}
                                    alt={ratedPerson.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'; }}
                                />
                            ) : (
                                <User size={32} className="text-pine-400" />
                            )}
                        </div>
                        <span className="font-medium text-pine-800">{ratedPerson.name}</span>
                        <span className="text-sm text-pine-500">
                            {user?.id === transaction?.buyerId ? '賣家' : '買家'}
                        </span>
                    </div>
                )}

                {hasRated ? (
                    <div className="text-center">
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    size={32}
                                    className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <p className="text-pine-600 mb-6">您已完成評價！</p>
                        <button
                            onClick={() => setCurrentPage('notifications')}
                            className="px-6 py-3 bg-pine-800 text-white rounded-2xl hover:bg-pine-700 transition"
                        >
                            回到通知
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoverScore(i)}
                                    onMouseLeave={() => setHoverScore(0)}
                                    onClick={() => setScore(i)}
                                    className="transition transform hover:scale-110"
                                >
                                    <Star
                                        size={36}
                                        className={`${i <= (hoverScore || score)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                            } transition`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-pine-500 mb-4">
                            {score === 0 ? '請選擇評分' : `${score} 顆星`}
                        </p>

                        {/* Comment */}
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="留下評價（選填）"
                            className="w-full p-3 border border-pine-200 rounded-xl resize-none focus:outline-none focus:border-forest-400 mb-4"
                            rows={3}
                        />

                        {error && (
                            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={score === 0 || submitting}
                            className={`w-full py-3 rounded-2xl font-medium transition ${score > 0 && !submitting
                                ? 'bg-forest-600 text-white hover:bg-forest-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? '提交中...' : '提交評價'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingPage;
