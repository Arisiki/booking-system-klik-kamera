import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import BookingForms from './BookingForms';
import ReviewForm from '@/Components/ReviewForm';

export default function Orders() {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [review, setReview] = useState(false);

    const { orders } = usePage().props;
    console.log(orders);

    useEffect(() => {
        router.reload({ only: ['orders'] });
    }, []);

    const handleCancelOrder = (orderId) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/orders/${orderId}/cancel`, {}, {
                onSuccess: () => {
                    alert('Order cancelled successfully!');
                    router.reload({ only: ['orders'] });
                },
                onError: (errors) => {
                    alert('Failed to cancel order: ' + (errors.error || 'Unknown error'));
                },
            });
        }
    };

    const handleExtendOrder = (product, order, item) => {
        setSelectedProduct(product);
        setSelectedOrder({ order, item });
        setShowBookingForm(true);
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    return (
        <div className="container mx-auto p-4">
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>
            {orders.length > 0 ? (
                <div>
                    {orders.map((order) => (
                        <div key={order.id} className="mb-6 p-4 border rounded">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Order ID</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Products</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Start Date</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>End Date</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Cost</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.id}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {order.order_items.map((item) => (
                                                <div key={item.id}>{item.product.name} (Qty: {item.quantity})</div>
                                            ))}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {new Date(order.start_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {new Date(order.end_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            Rp {order.total_cost}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.status}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    style={{
                                                        marginRight: '10px',
                                                        backgroundColor: 'red',
                                                        color: 'white',
                                                        padding: '5px 10px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {order.status === 'payment_complete' && (
                                                <button
                                                    onClick={() => router.visit(`/orders/${order.id}/qc`)}
                                                    style={{
                                                        marginRight: '10px',
                                                        backgroundColor: 'orange',
                                                        color: 'white',
                                                        padding: '5px 10px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Isi QC
                                                </button>
                                            )}
                                            {order.status === 'Booked' && (
                                                order.order_items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleExtendOrder(item.product, order, item)}
                                                        style={{
                                                            backgroundColor: 'green',
                                                            color: 'white',
                                                            padding: '5px 10px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Extend
                                                    </button>
                                                ))
                                            )}
                                            {order.status === 'completed' && !order.review && (
                                                order.order_items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setReview(true)}
                                                        style={{
                                                            backgroundColor: 'blueviolet',
                                                            color: 'white',
                                                            padding: '5px 10px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Tambahkan Review
                                                    </button>
                                                ))
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {order.status === 'completed' && !order.review && review && (
                                <ReviewForm order={order} setReview={setReview} />
                            )}
                            {order.review && (
                                <div className="mt-4 p-4 border rounded bg-gray-100">
                                    <h3 className="text-lg font-bold">Your Review</h3>
                                    <p>Rating: {'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}</p>
                                    <p>Comment: {order.review.comment || 'No comment'}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>You have no orders yet.</p>
            )}
            {showBookingForm && selectedProduct && selectedOrder && (
                <BookingForms
                    product={selectedProduct}
                    onClose={handleCloseForm}
                    isAddToCart={false}
                    phoneNumber={selectedOrder.order.phone_number}
                    quantity={selectedOrder.item.quantity}
                    extendAddress={selectedOrder.order.address}
                    isExtend={true}
                />
            )}
        </div>
    );
}