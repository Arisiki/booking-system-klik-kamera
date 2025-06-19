import { useState, useEffect } from 'react';
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

    console.log(product);
    

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
                        className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-md"
                    >
                        <FiEdit className="mr-2" /> Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 text-white bg-red-500 rounded-md"
                    >
                        <FiTrash2 className="mr-2" /> Hapus
                    </button>
                </div>
            </div>
            
            <div className="overflow-hidden bg-white rounded-md shadow-sm">
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <div className="flex justify-center items-center p-4 h-64 bg-gray-100 rounded-md">
                                {product.image_path ? (
                                    <img
                                        src={product.image_path}
                                        alt={product.name}
                                        className="object-contain max-w-full max-h-full"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Tidak ada gambar</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="mb-2 text-lg font-medium">Informasi Produk</h3>
                                <div className="p-4 bg-gray-50 rounded-md">
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
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Harga per Hari</p>
                                            {product.is_on_sale && product.discount_end_date && new Date(product.discount_end_date) >= new Date() ? (
                                                <div className="flex flex-col">
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-lg font-semibold text-green-600">
                                                            {product.discount_percentage > 0 
                                                                ? formatRupiah(product.price_per_day * (1 - product.discount_percentage / 100))
                                                                : formatRupiah(product.price_per_day - product.discount_amount)
                                                            }
                                                        </span>
                                                        <span className="px-2 py-1 text-xs text-red-600 bg-red-100 rounded-full">
                                                            {product.discount_percentage > 0 
                                                                ? `-${product.discount_percentage}% OFF`
                                                                : `-${formatRupiah(product.discount_amount)} OFF`
                                                            }
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatRupiah(product.price_per_day)}
                                                    </span>
                                                    <span className="mt-1 text-xs text-gray-400">
                                                        Berlaku sampai: {new Date(product.discount_end_date).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-semibold text-green-600">
                                                    {formatRupiah(product.price_per_day)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <h2 className="mb-2 text-xl font-semibold">{product.name}</h2>
                            
                            <div className="mb-6">
                                <h3 className="mb-2 text-lg font-medium">Deskripsi</h3>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p className="text-gray-700 whitespace-pre-line">{product.description || 'Tidak ada deskripsi'}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="mb-2 text-lg font-medium">Spesifikasi</h3>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    {product.specifications ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <h3 className="mb-2 text-lg font-medium">Riwayat Pembaruan</h3>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-500">Dibuat pada</p>
                                    <p className="font-medium">{moment(product.created_at).format('DD MMMM YYYY, HH:mm')}</p>
                                    
                                    <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui</p>
                                    <p className="font-medium">{moment(product.updated_at).format('DD MMMM YYYY, HH:mm')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-medium">Ketersediaan Produk</h3>
                
                <div className="mb-4">
                    <label htmlFor="month" className="block mb-1 text-sm font-medium text-gray-700">
                        Pilih Bulan
                    </label>
                    <input
                        type="month"
                        id="month"
                        className="rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(e.target.value)}
                    />
                </div>
                
                {isLoading ? (
                    <div className="py-4 text-center bg-white rounded-md shadow-sm">
                        <svg className="mx-auto w-8 h-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-gray-600">Memuat data ketersediaan...</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white rounded-md shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Tersedia
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
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