import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { formatRupiah } from '@/utils';

export default function ProductShow({ product, categories, brands }) {
    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (product) {
            fetchAvailabilityData();
        }
    }, [product, currentMonth]);

    const fetchAvailabilityData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('admin.availability.data'), {
                params: {
                    product_id: product.id,
                    month: currentMonth
                }
            });
            setAvailabilityData(response.data);
        } catch (error) {
            console.error('Error fetching availability data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('admin.products.destroy', product.id));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Detail Produk - ${product.name}`} />
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link
                        href={route('admin.products.index')}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <FiArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-semibold">Detail Produk</h1>
                </div>
                <div className="flex space-x-2">
                    <Link
                        href={route('admin.products.edit', product.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
                    >
                        <FiEdit className="mr-2" /> Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                    >
                        <FiTrash2 className="mr-2" /> Hapus
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <div className="bg-gray-100 rounded-md p-4 flex items-center justify-center h-64">
                                {product.image_path ? (
                                    <img
                                        src={product.image_path}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Tidak ada gambar</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="text-lg font-medium mb-2">Informasi Produk</h3>
                                <div className="bg-gray-50 rounded-md p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">ID Produk</p>
                                            <p className="font-medium">{product.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Stok</p>
                                            <p className="font-medium">{product.stock} unit</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kategori</p>
                                            <p className="font-medium">{product.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Brand</p>
                                            <p className="font-medium">{product.brand}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tipe Kamera</p>
                                            <p className="font-medium">{product.camera_type || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Harga per Hari</p>
                                            <p className="font-medium text-green-600">{formatRupiah(product.price_per_day)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">Deskripsi</h3>
                                <div className="bg-gray-50 rounded-md p-4">
                                    <p className="text-gray-700 whitespace-pre-line">{product.description || 'Tidak ada deskripsi'}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">Spesifikasi</h3>
                                <div className="bg-gray-50 rounded-md p-4">
                                    {product.specifications ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(product.specifications).map(([key, value]) => (
                                                <div key={key}>
                                                    <p className="text-sm text-gray-500">{key}</p>
                                                    <p className="font-medium">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Tidak ada spesifikasi</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">Riwayat Pembaruan</h3>
                                <div className="bg-gray-50 rounded-md p-4">
                                    <p className="text-sm text-gray-500">Dibuat pada</p>
                                    <p className="font-medium">{moment(product.created_at).format('DD MMMM YYYY, HH:mm')}</p>
                                    
                                    <p className="text-sm text-gray-500 mt-2">Terakhir diperbarui</p>
                                    <p className="font-medium">{moment(product.updated_at).format('DD MMMM YYYY, HH:mm')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Ketersediaan Produk</h3>
                
                <div className="mb-4">
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Bulan
                    </label>
                    <input
                        type="month"
                        id="month"
                        className="border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(e.target.value)}
                    />
                </div>
                
                {isLoading ? (
                    <div className="text-center py-4 bg-white rounded-md shadow-sm">
                        <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-gray-600">Memuat data ketersediaan...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-md shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tersedia
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Booking
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availabilityData && availabilityData.length > 0 ? (
                                        availabilityData.map((day) => (
                                            <tr key={day.date}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {moment(day.date).format('DD MMMM YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        day.available === 0 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : day.available < day.total / 2 
                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {day.available} / {day.total}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {day.bookings && day.bookings.length > 0 ? (
                                                        <ul className="text-sm">
                                                            {day.bookings.map((booking, index) => (
                                                                <li key={index} className="mb-1">
                                                                    <Link 
                                                                        href={route('admin.orders.show', booking.order_id)} 
                                                                        className="text-primary hover:underline"
                                                                    >
                                                                        Order #{booking.order_id}
                                                                    </Link>
                                                                    : {booking.quantity} unit ({booking.customer})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-gray-500">Tidak ada booking</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                                Tidak ada data ketersediaan untuk bulan ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                <div className="mt-4">
                    <Link
                        href={route('admin.availability.index', { product_id: product.id })}
                        className="text-primary hover:underline"
                    >
                        Lihat kalender ketersediaan lengkap
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}