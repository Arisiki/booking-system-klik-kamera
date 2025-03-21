import React from 'react';
import { usePage, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';

export default function Orders() {
    const { orders } = usePage().props;

    const handleCancelOrder = (orderId) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/orders/${orderId}/cancel`, {}, {
                onSuccess: () => {
                    alert('Order cancelled successfully!');
                },
                onError: (errors) => {
                    alert('Failed to cancel order: ' + (errors.error || 'Unknown error'));
                },
            });
        }
    };

    const handleExtendOrder = (orderId) => {
        const newEndDate = prompt('Enter new end date (YYYY-MM-DD):');
        if (newEndDate) {
            router.post(`/orders/${orderId}/extend`, { new_end_date: newEndDate }, {
                onSuccess: () => {
                    alert('Order extended successfully!');
                },
                onError: (errors) => {
                    alert('Failed to extend order: ' + (errors.error || 'Unknown error'));
                },
            });
        }
    };

    return (
        <div>
            <Navbar />
            <h1>My Orders</h1>
            {orders.length > 0 ? (
                <div>
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
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.id}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {order.order_items.map((item) => (
                                            <div key={item.id}>{item.product.name} (Qty: {item.quantity})</div>
                                        ))}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.start_date}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.end_date}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Rp {order.total_cost}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.status}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                style={{ marginRight: '10px', backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {(order.status === 'processed' || order.status === 'completed') && (
                                            <button
                                                onClick={() => handleExtendOrder(order.id)}
                                                style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}
                                            >
                                                Extend
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>You have no orders yet.</p>
            )}
        </div>
    );
}