import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Checkout() {
    const { order, snapToken } = usePage().props;
    const [isSnapReady, setIsSnapReady] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State untuk melacak apakah popup sudah terbuka

    console.log(order);

    useEffect(() => {
        // Cek apakah window.snap tersedia
        const checkSnap = setInterval(() => {
            if (window.snap) {
                setIsSnapReady(true);
                clearInterval(checkSnap);
            }
        }, 100);

        return () => {
            clearInterval(checkSnap);
            // Tutup popup jika ada saat komponen di-unmount
            if (window.snap) {
                window.snap.hide();
            }
        };
    }, []);

    const handlePayment = () => {
        if (isSnapReady && window.snap && !isPopupOpen) {
            setIsPopupOpen(true); // Tandai bahwa popup sudah terbuka
            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result) {
                    alert('Payment Success');
                    setIsPopupOpen(false); // Reset state setelah sukses
                    router.visit('/orders');
                },
                onError: function (result) {
                    alert('Payment failed');
                    console.log(result);
                    setIsPopupOpen(false); // Reset state setelah gagal
                },
                onPending: function (result) {
                    alert('Waiting for your Payment...');
                    setIsPopupOpen(false); // Reset state setelah pending
                    router.visit('/orders');
                },
                onClose: function () {
                    setIsPopupOpen(false); // Reset state saat popup ditutup
                },
            });
        } else if (!isSnapReady) {
            console.error('Snap is not ready');
            alert('Payment system is still loading. Please try again in a moment.');
        }
    };

    useEffect(() => {
        if (isSnapReady && snapToken && window.snap && !isPopupOpen) {
            setTimeout(() => {
                handlePayment();
            }, 500);
        }
    }, [isSnapReady, snapToken, isPopupOpen]); // Tambah isPopupOpen ke dependencies

    return (
        <div className="flex gap-2">
            <div>
                <h1 className="text-2xl font-bold">Checkout</h1>
                <h3>Order Details</h3>
                <p>User: {order.user_name}</p>
                <p>Email: {order.email}</p>
                <p>Phone: {order.phone_number}</p>
                <p>
                    Order Date:{' '}
                    {new Date(order.order_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <p>
                    Start Date:{' '}
                    {new Date(order.start_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <p>
                    End Date:{' '}
                    {new Date(order.end_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <p>Pickup Method: {order.pickup_method}</p>
                <p>Total Cost: Rp {order.total_cost}</p>
                <p>Status: {order.status}</p>
            </div>
            <div>
                <h3>Order Items</h3>
                {order.order_items.map((item, index) => (
                    <div key={index}>
                        <p>Product: {item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Rental Cost: Rp {item.rental_cost}</p>
                        <p>Pick Up Address: {item.address || 'N/A'}</p>
                    </div>
                ))}
            </div>

            <div id="snap-container" className="w-1/2"></div>
        </div>
    );
}