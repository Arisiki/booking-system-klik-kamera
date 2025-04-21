import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiEye, FiSearch, FiFilter, FiDownload, FiPlus } from 'react-icons/fi';
import { formatRupiah } from '@/utils';

export default function OrdersIndex({ orders, filters, statuses }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.orders.index'), { 
            search: searchQuery,
            status: statusFilter,
            date_from: dateFrom,
            date_to: dateTo
        }, { 
            preserveState: true 
        });
    };

    const handleExport = () => {
        // Create a URL with the current filters
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        // Open the export URL in a new tab
        window.open(`${route('admin.orders.export')}?${params.toString()}`, '_blank');
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

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    console.log(orders);
    

    return (
        <AdminLayout>
            <Head title="Orders Management" />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Orders Management</h1>
                
                <div className="flex gap-2">
                    <Link
                        href={route('admin.orders.create')}
                        className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary-dark"
                    >
                        <FiPlus /> Create Offline Order
                    </Link>
                    
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
                    >
                        <FiDownload /> Export to CSV
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-1">
                            <input
                                type="text"
                                placeholder="Search by order ID or customer name..."
                                className="flex-1 border-gray-300 rounded-l-md focus:ring-primary focus:border-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-r-md"
                            >
                                <FiSearch />
                            </button>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="relative">
                                <select
                                    className="appearance-none border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <FiFilter className="text-gray-400" />
                                </div>
                            </div>
                            
                            {/* Add Date Range Filters */}
                            <div className="flex items-center gap-2 ml-2">
                                <div>
                                    <label htmlFor="date_from" className="block text-xs text-gray-500">From</label>
                                    <input
                                        id="date_from"
                                        type="date"
                                        className="border border-gray-300 rounded-md pl-3 pr-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="date_to" className="block text-xs text-gray-500">To</label>
                                    <input
                                        id="date_to"
                                        type="date"
                                        className="border border-gray-300 rounded-md pl-3 pr-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Filter
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rental Period
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.user_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatRupiah(order.total_price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.duration} days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={route('admin.orders.show', order.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <FiEye className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {orders.links && (
                    <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {orders.from} to {orders.to} of {orders.total} orders
                            </div>
                            <div className="flex space-x-2">
                                {orders.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        preserveScroll
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}