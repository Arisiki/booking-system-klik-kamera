import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';


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

    return (
        <div className="container">
            <h1>{product.name}</h1>
            <p>Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('_', ' ')}</p>
            {product.camera_type && (
                <p>Jenis Kamera: {product.camera_type.charAt(0).toUpperCase() + product.camera_type.slice(1).replace('_', ' ')}</p>
            )}
            <p>Merek: {product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}</p>
            <p>Description: {product.description}</p>
            <p>Price per Day: Rp {product.price_per_day}</p>
            <p>Stock: {product.stock}</p>
            <div>
                <h3>Images:</h3>
                {product.images.map(image => (
                    <img key={image.id} src={image.image_path} alt="Product Image" />
                ))}
            </div>
            <button onClick={() => handleBooking(true)}>Add to Cart</button>
            <button onClick={() => handleBooking(false)}>Book Now</button>

            {showBookingForm && (
                <BookingForms
                    product={product}
                    onClose={handleCloseForm}
                    isAddToCart={isAddToCart}
                />
            )}
        </div>
    );
}