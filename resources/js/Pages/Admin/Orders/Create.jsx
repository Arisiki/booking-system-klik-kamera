import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatRupiah } from '@/utils';

export default function CreateOrder({ users, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        user_name: '',
        email: '',
        phone_number: '',
        start_date: '',
        end_date: '',
        pickup_time: '09:00',
        return_time: '17:00',
        pickup_method: 'pickup',
        items: [{ product_id: '', quantity: 1 }],
        is_offline: true,
        payment_method: 'cash',
        payment_status: 'completed',
        admin_notes: '',
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [duration, setDuration] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // When user is selected, update form data
    useEffect(() => {
        if (selectedUser) {
            setData({
                ...data,
                user_id: selectedUser.id,
                user_name: selectedUser.name,
                email: selectedUser.email,
                phone_number: selectedUser.phone || '',
            });
        }
    }, [selectedUser]);

    // Calculate duration and total price when dates or items change
    useEffect(() => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDuration(diffDays);

            // Calculate total price
            let total = 0;
            data.items.forEach((item, index) => {
                const product = selectedProducts[index];
                if (product && item.quantity > 0) {
                    const pricePerDay = product.has_active_discount ? product.discounted_price : product.price_per_day;
                    total += pricePerDay * item.quantity * diffDays;
                }
            });
            setTotalPrice(total);
        }
    }, [data.start_date, data.end_date, data.items, selectedProducts]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.orders.store'), {
            onSuccess: () => {
                reset();
                setSelectedUser(null);
                setSelectedProducts([]);
            },
        });
    };

    const addItem = () => {
        setData({
            ...data,
            items: [...data.items, { product_id: '', quantity: 1 }],
        });
        setSelectedProducts([...selectedProducts, null]);
    };

    const removeItem = (index) => {
        const updatedItems = [...data.items];
        updatedItems.splice(index, 1);
        setData({
            ...data,
            items: updatedItems,
        });

        const updatedProducts = [...selectedProducts];
        updatedProducts.splice(index, 1);
        setSelectedProducts(updatedProducts);
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData({
            ...data,
            items: updatedItems,
        });

        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            const updatedProducts = [...selectedProducts];
            updatedProducts[index] = product;
            setSelectedProducts(updatedProducts);
        }
    };

    return (
        <AdminLayout>
            <Head title="Create Offline Order" />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Create Offline Order</h1>
                <Link
                    href={route('admin.orders.index')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    Back to Orders
                </Link>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
                            
                            <div className="mb-4">
                                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Customer <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <select
                                    id="user_id"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.user_id}
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            setSelectedUser(null);
                                            setData({
                                                ...data,
                                                user_id: '',
                                            });
                                        } else {
                                            const user = users.find(u => u.id === parseInt(e.target.value));
                                            setSelectedUser(user);
                                        }
                                    }}
                                >
                                    <option value="">Select a customer (or leave empty for walk-in)</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && <div className="text-red-500 text-sm mt-1">{errors.user_id}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    id="user_name"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.user_name}
                                    onChange={(e) => setData('user_name', e.target.value)}
                                />
                                {errors.user_name && <div className="text-red-500 text-sm mt-1">{errors.user_name}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="phone_number"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                />
                                {errors.phone_number && <div className="text-red-500 text-sm mt-1">{errors.phone_number}</div>}
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-medium mb-4">Order Details</h2>
                            
                            <div className="mb-4">
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
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
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    min={data.start_date}
                                />
                                {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="pickup_time" className="block text-sm font-medium text-gray-700 mb-1">
                                        Pickup Time
                                    </label>
                                    <input
                                        type="time"
                                        id="pickup_time"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        value={data.pickup_time}
                                        onChange={(e) => setData('pickup_time', e.target.value)}
                                    />
                                    {errors.pickup_time && <div className="text-red-500 text-sm mt-1">{errors.pickup_time}</div>}
                                </div>
                                
                                <div>
                                    <label htmlFor="return_time" className="block text-sm font-medium text-gray-700 mb-1">
                                        Return Time
                                    </label>
                                    <input
                                        type="time"
                                        id="return_time"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        value={data.return_time}
                                        onChange={(e) => setData('return_time', e.target.value)}
                                    />
                                    {errors.return_time && <div className="text-red-500 text-sm mt-1">{errors.return_time}</div>}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="pickup_method" className="block text-sm font-medium text-gray-700 mb-1">
                                    Pickup Method
                                </label>
                                <select
                                    id="pickup_method"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.pickup_method}
                                    onChange={(e) => setData('pickup_method', e.target.value)}
                                >
                                    <option value="pickup">Pickup</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                                {errors.pickup_method && <div className="text-red-500 text-sm mt-1">{errors.pickup_method}</div>}
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    id="payment_method"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="e-wallet">E-Wallet</option>
                                </select>
                                {errors.payment_method && <div className="text-red-500 text-sm mt-1">{errors.payment_method}</div>}
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="text-lg font-medium mb-4">Order Items</h2>
                    
                    {data.items.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                            <div className="flex-1">
                                <label htmlFor={`product_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Product
                                </label>
                                <select
                                    id={`product_${index}`}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={item.product_id}
                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                >
                                    <option value="">Select a product</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {product.has_active_discount ? 
                                                `${formatRupiah(product.discounted_price)}/day (Diskon ${product.discount_percentage}%)` : 
                                                `${formatRupiah(product.price_per_day)}/day`
                                            }
                                        </option>
                                    ))}
                                </select>
                                {errors[`items.${index}.product_id`] && (
                                    <div className="text-red-500 text-sm mt-1">{errors[`items.${index}.product_id`]}</div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-32">
                                <label htmlFor={`quantity_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id={`quantity_${index}`}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                                {errors[`items.${index}.quantity`] && (
                                    <div className="text-red-500 text-sm mt-1">{errors[`items.${index}.quantity`]}</div>
                                )}
                            </div>
                            
                            <div className="w-full md:w-40 flex items-end">
                                {index > 0 && (
                                    <button
                                        type="button"
                                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                        onClick={() => removeItem(index)}
                                    >
                                        <FiTrash2 className="inline mr-1" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <div className="mb-6">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            onClick={addItem}
                        >
                            <FiPlus className="inline mr-1" /> Add Another Item
                        </button>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Notes
                        </label>
                        <textarea
                            id="admin_notes"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            value={data.admin_notes}
                            onChange={(e) => setData('admin_notes', e.target.value)}
                            rows={3}
                            placeholder="Add notes about this offline order"
                        ></textarea>
                        {errors.admin_notes && <div className="text-red-500 text-sm mt-1">{errors.admin_notes}</div>}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Duration:</span>
                            <span>{duration} days</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Price:</span>
                            <span>{formatRupiah(totalPrice)}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Offline Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}