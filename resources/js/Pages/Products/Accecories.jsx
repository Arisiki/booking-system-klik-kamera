import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';

export default function Accecories() {
    const { products, cameraTypes, brand } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddToCart, setIsAddToCart] = useState(false);

    const openBookingForm = (product, addToCart = false) => {
        setSelectedProduct(product);
        setIsAddToCart(addToCart);
    };

    const closeBookingForm = () => {
        setSelectedProduct(null);
        setIsAddToCart(false);
    };
    
    return (
        <div>
          <Navbar />
            <div>
                <h1>Aksesoris</h1>
                <div>
                    {products.map((product) => (
                        <div key={product.id}>
                            <img
                                src={product.image_path || 'https://via.placeholder.com/300'}
                                alt={product.name}
                            />
                            <div>
                                <h2>{product.name}</h2>
                                <p>{product.description}</p>
                                <p>
                                    Rp {product.price_per_day} / day
                                </p>
                                <p>Stock: {product.stock}</p>
                                <div>
                                    <button
                                        onClick={() => openBookingForm(product, true)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => openBookingForm(product, false)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popup Booking Form */}
                {selectedProduct && (
                    <div>
                        <div>
                            <BookingForms
                                product={selectedProduct}
                                onClose={closeBookingForm}
                                isAddToCart={isAddToCart}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}