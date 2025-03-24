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
        <div className="mt-4 p-4 border rounded">
            <h3 className="text-lg font-bold mb-2">Submit Your Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Rating (1-5 stars)</label>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`cursor-pointer text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Comment</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your comment here..."
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={rating === 0}
                >
                    Submit Review
                </button>
                <button
                  type='button'
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
                  onClick={() => setReview(false)}
                >
                  Cancel
                </button>
            </form>
        </div>
    );
}