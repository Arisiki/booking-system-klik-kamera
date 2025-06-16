import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { formatRupiah } from '@/utils';

export default function CreateProduct({ categories, brands }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price_per_day: '',
        stock: '',
        category: '',
        brand: '',
        camera_type: '',
        images: [],
        // Tambahan field diskon
        discount_percentage: '',
        discount_start_date: '',
        discount_end_date: '',
    });

    const [previews, setPreviews] = useState([]);

    // Fungsi untuk menghitung harga setelah diskon
    const calculateDiscountedPrice = () => {
        if (!data.price_per_day || !data.discount_percentage) return null;
        const originalPrice = parseFloat(data.price_per_day);
        const discountPercent = parseFloat(data.discount_percentage);
        return originalPrice - (originalPrice * discountPercent / 100);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate files before upload
        if (data.images.length > 0) {
            for (const file of data.images) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert(`File ${file.name} is too large. Maximum size is 2MB`);
                    return;
                }
            }
        }

        // Create FormData
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'images') {
                data.images.forEach(file => {
                    formData.append('images[]', file);
                });
            } else {
                formData.append(key, data[key]);
            }
        });

        post(route('admin.products.store'), formData, {
            onSuccess: () => {
                reset();
                setPreviews([]);
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                if (errors.error) {
                    alert(errors.error);
                } else {
                    alert('Failed to create product. Please try again.');
                }
            }
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', [...data.images, ...files]); // Append new files to existing ones
        
        // Create previews for all selected files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Clean up the URL
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    return (
        <AdminLayout>
            <Head title="Create Product" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-semibold">Create New Product</h1>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="block mt-1 w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="price_per_day" value="Price Per Day" />
                                        <TextInput
                                            id="price_per_day"
                                            type="number"
                                            name="price_per_day"
                                            value={data.price_per_day}
                                            className="block mt-1 w-full"
                                            onChange={(e) => setData('price_per_day', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.price_per_day} className="mt-2" />
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="stock" value="Stock" />
                                        <TextInput
                                            id="stock"
                                            type="number"
                                            name="stock"
                                            value={data.stock}
                                            className="block mt-1 w-full"
                                            onChange={(e) => setData('stock', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.stock} className="mt-2" />
                                    </div>
                                </div>

                                {/* Discount Settings Section */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Discount Settings (Optional)</h3>
                                    
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <InputLabel htmlFor="discount_percentage" value="Discount Percentage (%)" />
                                            <TextInput
                                                id="discount_percentage"
                                                type="number"
                                                name="discount_percentage"
                                                value={data.discount_percentage}
                                                className="block mt-1 w-full"
                                                onChange={(e) => setData('discount_percentage', e.target.value)}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                            <InputError message={errors.discount_percentage} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="discount_start_date" value="Start Date" />
                                            <TextInput
                                                id="discount_start_date"
                                                type="datetime-local"
                                                name="discount_start_date"
                                                value={data.discount_start_date}
                                                className="block mt-1 w-full"
                                                onChange={(e) => setData('discount_start_date', e.target.value)}
                                            />
                                            <InputError message={errors.discount_start_date} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="discount_end_date" value="End Date" />
                                            <TextInput
                                                id="discount_end_date"
                                                type="datetime-local"
                                                name="discount_end_date"
                                                value={data.discount_end_date}
                                                className="block mt-1 w-full"
                                                onChange={(e) => setData('discount_end_date', e.target.value)}
                                            />
                                            <InputError message={errors.discount_end_date} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Price Preview */}
                                    {data.price_per_day && data.discount_percentage && (
                                        <div className="p-3 mt-4 bg-blue-50 rounded-md">
                                            <h4 className="mb-2 font-medium text-blue-900">Price Preview:</h4>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 line-through">
                                                    {formatRupiah(parseFloat(data.price_per_day))}
                                                </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {formatRupiah(calculateDiscountedPrice())}
                                                </span>
                                                <span className="px-2 py-1 text-sm text-white bg-red-500 rounded">
                                                    -{data.discount_percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="category" value="Category" />
                                        <select
                                            id="category"
                                            name="category"
                                            value={data.category}
                                            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            onChange={(e) => setData('category', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category} className="mt-2" />
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="brand" value="Brand" />
                                        <select
                                            id="brand"
                                            name="brand"
                                            value={data.brand}
                                            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            onChange={(e) => setData('brand', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map((brand) => (
                                                <option key={brand} value={brand}>
                                                    {brand.charAt(0).toUpperCase() + brand.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.brand} className="mt-2" />
                                    </div>
                                </div>
                                
                                {data.category === 'camera' && (
                                    <div>
                                        <InputLabel htmlFor="camera_type" value="Camera Type" />
                                        <select
                                            id="camera_type"
                                            name="camera_type"
                                            value={data.camera_type}
                                            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            onChange={(e) => setData('camera_type', e.target.value)}
                                        >
                                            <option value="">Select Camera Type</option>
                                            <option value="dslr">DSLR</option>
                                            <option value="mirrorless">Mirrorless</option>
                                            <option value="point_and_shoot">Point and Shoot</option>
                                            <option value="action_camera">Action Camera</option>
                                        </select>
                                        <InputError message={errors.camera_type} className="mt-2" />
                                    </div>
                                )}
                                
                                <div>
                                    <InputLabel htmlFor="images" value="Product Images (Up to 3)" />
                                    <input
                                        id="images"
                                        type="file"
                                        name="images"
                                        className="block mt-1 w-full"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        multiple
                                        disabled={data.images.length >= 3}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {data.images.length}/3 images selected. {data.images.length >= 3 ? 'Maximum reached.' : ''}
                                    </p>
                                    <InputError message={errors.images} className="mt-2" />
                                    
                                    {/* Image previews */}
                                    {previews.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img 
                                                        src={preview} 
                                                        alt={`Preview ${index + 1}`} 
                                                        className="object-cover w-32 h-32 rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full"
                                                    >
                                                        ×
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute bottom-0 left-0 px-2 py-1 text-xs text-white rounded-tr-md bg-primary">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-end items-center">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Create Product
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}