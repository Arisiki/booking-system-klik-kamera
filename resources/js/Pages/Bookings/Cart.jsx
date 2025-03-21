import React from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';

export default function Cart() {
    const { cartItems, totalCost, auth } = usePage().props;
    const { post, processing, data, setData } = useForm({
        userName: auth.user.name
    });

    console.log(cartItems);
    

    const handleCheckout = () => {
        post(route('checkout'), {
            onSuccess: (response) => {
                const orderId = response.props.order.id;
                router.visit(`/checkout/${orderId}`);
            },
            onError: (errors) => console.log('Errors:', errors),
        });
    };

    return (
        <div>
            <Navbar />
            <h1>Shopping Cart</h1>
            {cartItems.length > 0 ? (
                <div>
                    {cartItems.map((item, index) => (
                        <div key={index}>
                            <h3>{item.product.name}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Start Date: {item.start_date}</p>
                            <p>End Date: {item.end_date}</p>
                            <p>Rental Cost: Rp {item.rental_cost}</p>
                            <p>Pickup Method: {item.pickup_method}</p>
                            {item.pickup_address && <p>Address: {item.pickup_address}</p>}
                        </div>
                    ))}
                    <h3>Total Cost: Rp {totalCost}</h3>

                    <button
                        onClick={handleCheckout}
                        disabled={processing}
                        className='px-4 py-2 border mb-20'
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