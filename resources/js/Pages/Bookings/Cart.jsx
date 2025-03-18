import React from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';

export default function Cart() {
    const { cartItems, totalCost } = usePage().props;
    const { post, processing } = useForm();
    
    const handleCheckout = () => {
        post(route('checkout'),
        {
            onSuccess: (response) => {
                const orderId = response.props.order.id;
                router.visit(`/checkout/${orderId}`);
            },
            onError: (errors) => console.log('Errors:', errors),
        });
    };

    
    
    return (
        <div>
            <Navbar/>
            <h1>Shopping Cart</h1>
            {cartItems.length > 0 ? (
                <div>
                    {cartItems.map((item, index) => (
                        <div key={index}>
                            <h3>{item.product.name}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Start Date: {item.start_date}</p>
                            <p>End Date: {item.end_date}</p>
                            <p>Pickup Method: {item.pickup_method}</p>
                            <p>Rental Cost: Rp {item.rental_cost}</p>
                        </div>
                    ))}
                    <h3>Total Cost: Rp {totalCost}</h3>
                    <button 
                        onClick={handleCheckout} 
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
}