import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ReviewForm({ order, setReview }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(`/orders/${order.id}/review`, {
            rating,
            comment,
        }, {
            onSuccess: () => {
                alert('Review submitted successfully!');
                router.reload({ only: ['orders'] });
            },
            onError: (errors) => {
                alert('Failed to submit review: ' + (errors.error || 'Unknown error'));
            },
        });
    };

    return (
        <div className="mt-4 p-6 border border-thrid/20 rounded-xl bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-primary">Kirim Review Anda</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-thrid">Rating (1-5 bintang)</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`cursor-pointer text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-thrid">Komentar</label>
                    <textarea
                        className="w-full p-3 border border-thrid/20 rounded-xl focus:ring-primary focus:border-primary"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tulis komentar Anda di sini..."
                    ></textarea>
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-bold"
                        disabled={rating === 0}
                    >
                        Kirim Review
                    </button>
                    <button
                        type='button'
                        className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors font-bold"
                        onClick={() => setReview(false)}
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}