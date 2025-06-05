import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils';
import { FiArrowLeft, FiPackage, FiCalendar, FiUser, FiClock, FiDollarSign, FiTruck, FiMapPin, FiFileText } from 'react-icons/fi';

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
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'picked_up':
                return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'returned':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'payment_complete':
                return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'booked':
                return 'bg-teal-100 text-teal-800 border border-teal-200';
            case 'being_returned':
                return 'bg-orange-100 text-orange-800 border border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const handleStatusUpdate = () => {
        // Add confirmation for critical status changes
        if (selectedStatus === 'cancelled' && !confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
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
    
    return (
        <AdminLayout>
            <Head title={`Order #${order.id}`} />
            
            <div className="mb-6 flex items-center">
                <Link
                    href={route('admin.orders.index')}
                    className="text-primary hover:underline flex items-center gap-2 font-medium"
                >
                    <FiArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
                </Link>
            </div>
            
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
                                {formatStatus(order.status)}
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">
                            Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    
                    <div className="flex flex-col md:items-end">
                        <p className="text-sm text-gray-500">Total Pesanan</p>
                        <p className="text-2xl font-bold text-primary">{formatRupiah(order.total_cost)}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Content - Left Side (2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                            <FiPackage className="text-primary mr-2" />
                            <h2 className="text-lg font-semibold">Item Pesanan</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produk
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harga/Hari
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jumlah
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Durasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.order_items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            className="h-12 w-12 object-cover"
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
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatRupiah(item.price_per_day)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {item.quantity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {order.duration} hari
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatRupiah(item.rental_cost)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-right font-medium text-gray-700">
                                            Total:
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                                            {formatRupiah(order.total_cost)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    {/* Data Diri per Item Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                            <FiUser className="text-primary mr-2" />
                            <h2 className="text-lg font-semibold">Data Diri per Item</h2>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {item.quantity} unit
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-y-3">
                                            <div className="text-sm text-gray-500">Nama</div>
                                            <div className="text-sm font-medium">{order.user_name}</div>
                                            
                                            <div className="text-sm text-gray-500">No. HP</div>
                                            <div className="text-sm font-medium">{order.phone_number || 'N/A'}</div>
                                            
                                            <div className="text-sm text-gray-500">Metode</div>
                                            <div className="text-sm font-medium">{item.pickup_method || order.pickup_method || 'N/A'}</div>
                                            
                                            <div className="text-sm text-gray-500">Alamat</div>
                                            <div className="text-sm font-medium">{item.pickup_address || order.pickup_address || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Payment Information Card (if exists) */}
                    {order.payment && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                                <FiDollarSign className="text-primary mr-2" />
                                <h2 className="text-lg font-semibold">Informasi Pembayaran</h2>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                                        <p className="font-medium">{order.payment.status}</p>
                                        
                                        <p className="text-sm text-gray-500 mb-1 mt-3">Metode Pembayaran</p>
                                        <p className="font-medium">{order.payment.payment_method || 'N/A'}</p>
                                        
                                        <p className="text-sm text-gray-500 mb-1 mt-3">ID Transaksi</p>
                                        <p className="font-medium">{order.payment.transaction_id || 'N/A'}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Jumlah Dibayar</p>
                                        <p className="font-medium text-primary">{formatRupiah(order.payment.amount)}</p>
                                        
                                        <p className="text-sm text-gray-500 mb-1 mt-3">Tanggal Pembayaran</p>
                                        <p className="font-medium">
                                            {order.payment.paid_at 
                                                ? new Date(order.payment.paid_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) 
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Quality Control Check Card (if exists) */}
                    {order.quality_control_check && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                                <FiFileText className="text-primary mr-2" />
                                <h2 className="text-lg font-semibold">Quality Control Check</h2>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Tanggal Pemeriksaan</p>
                                        <p className="font-medium">
                                            {new Date(order.quality_control_check.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        
                                        <p className="text-sm text-gray-500 mb-1 mt-3">Diperiksa Oleh</p>
                                        <p className="font-medium">{order.quality_control_check.checked_by || 'System'}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                        <p className="font-medium">{order.quality_control_check.status}</p>
                                        
                                        <p className="text-sm text-gray-500 mb-1 mt-3">Catatan</p>
                                        <p className="font-medium">{order.quality_control_check.notes || 'Tidak ada catatan'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Admin Notes Card (if exists) */}
                    {order.admin_notes && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                                <FiFileText className="text-primary mr-2" />
                                <h2 className="text-lg font-semibold">Catatan Admin</h2>
                            </div>
                            
                            <div className="p-6">
                                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                                    {order.admin_notes}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Sidebar - Right Side (1 column) */}
                <div className="space-y-6">
                    {/* Customer Information Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                            <FiUser className="text-primary mr-2" />
                            <h2 className="text-lg font-semibold">Informasi Pelanggan</h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mr-3">
                                    {order.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{order.user_name}</h3>
                                    <p className="text-sm text-gray-500">{order.email}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-3">
                                {order.phone_number && (
                                    <div className="flex">
                                        <div className="w-5 text-gray-400 mr-2">
                                            <FiUser className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm">{order.phone_number}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                            <FiCalendar className="text-primary mr-2" />
                            <h2 className="text-lg font-semibold">Detail Pesanan</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tanggal Pemesanan</p>
                                <p className="font-medium">
                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Periode Sewa</p>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        <p className="text-sm">
                                            <span className="font-medium">Mulai:</span> {new Date(order.start_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                        <p className="text-sm">
                                            <span className="font-medium">Selesai:</span> {new Date(order.end_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Durasi</p>
                                <p className="font-medium">{order.duration} hari</p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Biaya</p>
                                <p className="font-medium text-primary text-lg">{formatRupiah(order.total_cost)}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Update Status Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center">
                            <FiClock className="text-primary mr-2" />
                            <h2 className="text-lg font-semibold">Perbarui Status</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status Pesanan
                                </label>
                                <select
                                    id="status"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
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
                                <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan Admin
                                </label>
                                <textarea
                                    id="admin_notes"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Tambahkan catatan tentang pesanan ini (opsional)"
                                ></textarea>
                            </div>
                            
                            <button
                                type="button"
                                className={`w-full px-4 py-3 rounded-lg font-medium text-white ${
                                    processing || selectedStatus === order.status || order.status === 'cancelled' || order.status === 'completed'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 transition-colors'
                                }`}
                                onClick={handleStatusUpdate}
                                disabled={processing || selectedStatus === order.status || order.status === 'cancelled' || order.status === 'completed'}
                            >
                                {processing ? 'Memperbarui...' : 'Perbarui Status'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}