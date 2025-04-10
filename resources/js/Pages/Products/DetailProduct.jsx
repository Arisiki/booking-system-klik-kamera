import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';

export default function DetailProduct() {
    const { product } = usePage().props;
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [isAddToCart, setIsAddToCart] = useState(false);

    const handleBooking = (addToCart = false) => {
        setIsAddToCart(addToCart);
        setShowBookingForm(true);
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
    };

    console.log(product);


    const [isImageActive, setImageActive] = useState(product.images)
    // useEffect(() => {
        
    // }, [])

    console.log(isImageActive);
    




    return (
        <article className="section-container">
            <Navbar/>

            <div>
                <section className='w-full flex flex-col gap-4'>
                    <img src={product.images[0].image_path} alt="" className='w-full h-[317px]' />
                    <div className='flex flex-row justify-around'>
                        {product.images.map((img) => (
                            <img src={img.image_path}/>
                        ))}
                    </div>
                </section>
                <section>

                </section>
                <section>
                    
                </section>
            </div>
            









            {/* <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <p>Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('_', ' ')}</p>
            {product.camera_type && (
                <p>Jenis Kamera: {product.camera_type.charAt(0).toUpperCase() + product.camera_type.slice(1).replace('_', ' ')}</p>
            )}
            <p>Merek: {product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}</p>
            <p>Description: {product.description}</p>
            <p>Price per Day: Rp {product.price_per_day}</p>
            <p>Stock: {product.stock}</p>
            <div className="mb-4">
                <h3 className="text-lg font-bold">Images:</h3>
                {product.images.map(image => (
                    <img key={image.id} src={image.image_path} alt="Product Image" className="w-1/2 h-auto rounded mb-2" />
                ))}
            </div>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => handleBooking(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add to Cart
                </button>
                <button
                    onClick={() => handleBooking(false)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Book Now
                </button>
            </div> */}

            {showBookingForm && (
                <BookingForms
                    product={product}
                    onClose={handleCloseForm}
                    isAddToCart={isAddToCart}
                />
            )}

            {/* Bagian Ulasan */}
            {/* <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Product Reviews</h2>
                {product.reviews && product.reviews.length > 0 ? (
                    <div>
                        {product.reviews.map((review) => (
                            <div key={review.id} className="mb-4 p-4 border rounded">
                                <p className="font-bold">{review.user.name}</p>
                                <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                <p>Comment: {review.comment || 'No comment'}</p>
                                <p className="text-sm text-gray-500">
                                    Reviewed on {new Date(review.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div> */}
        </article>
    );
}