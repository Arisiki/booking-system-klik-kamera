import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useForm } from '@inertiajs/react';

const localizer = momentLocalizer(moment);

export default function AvailabilityIndex({ products, selectedProduct, availabilityData, currentMonth }) {
    const [selectedProductId, setSelectedProductId] = useState(selectedProduct?.id || '');
    const [month, setMonth] = useState(currentMonth || moment().format('YYYY-MM'));
    const [calendarData, setCalendarData] = useState([]);
    const [showBlockModal, setShowBlockModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: selectedProductId,
        start_date: '',
        end_date: '',
        reason: '',
    });
    
    useEffect(() => {
        if (availabilityData) {
            transformDataForCalendar();
        }
    }, [availabilityData]);
    
    const transformDataForCalendar = () => {
        const events = [];
        
        availabilityData.forEach(day => {
            if (day.bookings.length > 0) {
                day.bookings.forEach(booking => {
                    events.push({
                        title: `Booked: ${booking.quantity} units (${booking.customer})`,
                        start: new Date(day.date),
                        end: new Date(day.date),
                        allDay: true,
                        resource: booking
                    });
                });
            }
            
            // Add availability info
            events.push({
                title: `Available: ${day.available}/${day.total}`,
                start: new Date(day.date),
                end: new Date(day.date),
                allDay: true,
                resource: { type: 'availability', available: day.available, total: day.total }
            });
        });
        
        setCalendarData(events);
    };
    
    const handleProductChange = (e) => {
        const productId = e.target.value;
        setSelectedProductId(productId);
        setData('product_id', productId);
        window.location.href = route('admin.availability.index', { product_id: productId, month });
    };
    
    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        window.location.href = route('admin.availability.index', { product_id: selectedProductId, month: newMonth });
    };
    
    const openBlockModal = () => {
        setShowBlockModal(true);
    };
    
    const closeBlockModal = () => {
        setShowBlockModal(false);
        reset();
    };
    
    const handleBlockDates = (e) => {
        e.preventDefault();
        post(route('admin.availability.block'), {
            onSuccess: () => {
                closeBlockModal();
                window.location.reload();
            }
        });
    };
    
    const eventStyleGetter = (event) => {
        let style = {
            backgroundColor: '#3788d8',
            borderRadius: '0px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        
        if (event.resource && event.resource.type === 'availability') {
            const availability = event.resource.available / event.resource.total;
            
            if (availability === 0) {
                style.backgroundColor = '#e74c3c'; // Red for no availability
            } else if (availability < 0.5) {
                style.backgroundColor = '#f39c12'; // Orange for low availability
            } else {
                style.backgroundColor = '#2ecc71'; // Green for good availability
            }
        }
        
        return { style };
    };
    
    return (
        <AdminLayout>
            <Head title="Product Availability" />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Product Availability</h1>
                <button
                    onClick={openBlockModal}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                    Block Dates
                </button>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="w-full md:w-1/3">
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Product
                        </label>
                        <select
                            id="product"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            value={selectedProductId}
                            onChange={handleProductChange}
                        >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-full md:w-1/3">
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Month
                        </label>
                        <input
                            type="month"
                            id="month"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            value={month}
                            onChange={handleMonthChange}
                        />
                    </div>
                </div>
                
                {selectedProduct ? (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium mb-4">
                            Availability for {selectedProduct.name} - {moment(month).format('MMMM YYYY')}
                        </h2>
                        
                        <div style={{ height: 600 }}>
                            <Calendar
                                localizer={localizer}
                                events={calendarData}
                                startAccessor="start"
                                endAccessor="end"
                                views={['month']}
                                defaultView="month"
                                defaultDate={new Date(month)}
                                eventPropGetter={eventStyleGetter}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        Please select a product to view availability
                    </div>
                )}
            </div>
            
            {showBlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Block Dates</h2>
                        
                        <form onSubmit={handleBlockDates}>
                            <div className="mb-4">
                                <label htmlFor="block_product" className="block text-sm font-medium text-gray-700 mb-1">
                                    Product
                                </label>
                                <select
                                    id="block_product"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    min={moment().format('YYYY-MM-DD')}
                                    required
                                />
                                {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    min={data.start_date || moment().format('YYYY-MM-DD')}
                                    required
                                />
                                {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    id="reason"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    rows="3"
                                />
                                {errors.reason && <div className="text-red-500 text-sm mt-1">{errors.reason}</div>}
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeBlockModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Block Dates'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}