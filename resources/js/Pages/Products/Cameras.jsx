import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';
import CardProduct from '@/Components/CardProduct';
import Footer from '@/Layouts/Footer';

export default function Cameras() {
    const { products, cameraTypes, brand } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddToCart, setIsAddToCart] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const user = usePage().props.auth.user;

    const handleBooking = (product, addToCart = false) => {
        if (!user) return router.visit(route('login'));
        
        setSelectedProduct(product);
        setIsAddToCart(addToCart);
        setShowBookingForm(true);
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
        setSelectedProduct(null);
    };
    
    console.log(selectedProduct);
    
    return (
        <main>
          <Navbar />
            <article className='section-container h-[100dvh] mt-4'>
            {products && products.length > 0 ? (
                <div className='grid grid-cols-2 minitab:grid-cols-3 md:grid-cols-4 laptop:grid-cols-5 gap-8'>
                    {products.map(product => (
                            <CardProduct
                                key={product.id}
                                product={product}
                                productName={product.name}
                                productPrice={product.price_per_day}
                                bookNow={() => handleBooking(product, false)}
                                addToCart={() => handleBooking(product, true)}
                                productId={product.id}
                                productImage={product.images}
                            />
                    ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-700 text-lg mb-4">Produk belum tersedia/belum ditambahkan oleh admin.</p>
                </div>
            )}

            {showBookingForm && selectedProduct && (
                    <BookingForms
                        product={selectedProduct}
                        onClose={handleCloseForm}
                        isAddToCart={isAddToCart}
                    />
                )}
            </article>
            <Footer />
        </main>
    );
}