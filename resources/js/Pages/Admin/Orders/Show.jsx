import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils';

export default function OrderShow({ order, statuses }) {
    const [processing, setProcessing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');

    const formatStatus = (status) => {
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'picked_up':
                return 'bg-purple-100 text-purple-800';
            case 'returned':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusUpdate = () => {
        // Add confirmation for critical status changes
        if (selectedStatus === 'cancelled' && !confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }
        
        setProcessing(true);
        router.put(route('admin.orders.update-status', order.id), {
            status: selectedStatus,
            admin_notes: adminNotes
        }, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };

    console.log(order);
    console.log(statuses);
    
    

    return (
        <AdminLayout>
            <Head title={`Order #${order.id}`} />
            
            <div className="mb-6">
                <Link
                    href={route('admin.orders.index')}
                    className="text-primary hover:underline"
                >
                    &larr; Back to Orders
                </Link>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {order.user_name}</p>
                        <p><span className="font-medium">Email:</span> {order.email}</p>
                        <p><span className="font-medium">Phone:</span> {order.phone || 'N/A'}</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                        <p><span className="font-medium">Rental Period:</span> {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Duration:</span> {order.duration} days</p>
                        <p><span className="font-medium">Total:</span> {formatRupiah(order.total_price)}</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Order Status
                            </label>
                            <select
                                id="status"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                disabled={order.status === 'cancelled' || order.status === 'completed'}
                            >
                                {Object.entries(statuses).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Notes
                            </label>
                            <textarea
                                id="admin_notes"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                                placeholder="Add notes about this order (optional)"
                            ></textarea>
                        </div>
                        
                        <button
                            type="button"
                            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                            onClick={handleStatusUpdate}
                            disabled={processing || selectedStatus === order.status || order.status === 'cancelled' || order.status === 'completed'}
                        >
                            {processing ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price/Day
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.order_items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-md object-cover"
                                                    src={item.product.image_path ? `/storage/${item.product.image_path}` : '/icons/Kamera.png'}
                                                    alt={item.product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.product.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.product.brand}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatRupiah(item.price_per_day)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {item.quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.duration} days
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatRupiah(item.price_per_day * item.quantity * order.duration)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-right font-medium">
                                    Total:
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold">
                                    {formatRupiah(order.total_price)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            {order.payment && (
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Payment Status:</span> {order.payment.status}</p>
                            <p><span className="font-medium">Payment Method:</span> {order.payment.payment_method || 'N/A'}</p>
                            <p><span className="font-medium">Transaction ID:</span> {order.payment.transaction_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Paid Amount:</span> {formatRupiah(order.payment.amount)}</p>
                            <p><span className="font-medium">Payment Date:</span> {order.payment.paid_at ? new Date(order.payment.paid_at).toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {order.quality_control_check && (
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Quality Control Check</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Check Date:</span> {new Date(order.quality_control_check.created_at).toLocaleString()}</p>
                            <p><span className="font-medium">Checked By:</span> {order.quality_control_check.checked_by || 'System'}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Status:</span> {order.quality_control_check.status}</p>
                            <p><span className="font-medium">Notes:</span> {order.quality_control_check.notes || 'No notes'}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Display admin notes if they exist */}
            {order.admin_notes && (
                <div className="bg-white p-6 rounded-md shadow-sm mt-6">
                    <h2 className="text-lg font-semibold mb-2">Admin Notes</h2>
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        {order.admin_notes}
                    </div>
                </div>
            )}
            
            {order.quality_control_check && (
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Quality Control Check</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Check Date:</span> {new Date(order.quality_control_check.created_at).toLocaleString()}</p>
                            <p><span className="font-medium">Checked By:</span> {order.quality_control_check.checked_by || 'System'}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Status:</span> {order.quality_control_check.status}</p>
                            <p><span className="font-medium">Notes:</span> {order.quality_control_check.notes || 'No notes'}</p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}