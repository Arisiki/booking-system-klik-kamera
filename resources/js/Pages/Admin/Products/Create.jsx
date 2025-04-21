import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

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
    });

    const [previews, setPreviews] = useState([]); 

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => {
                reset();
                setPreviews([]);
            },
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Create New Product</h1>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
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
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="price_per_day" value="Price Per Day" />
                                        <TextInput
                                            id="price_per_day"
                                            type="number"
                                            name="price_per_day"
                                            value={data.price_per_day}
                                            className="mt-1 block w-full"
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
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('stock', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.stock} className="mt-2" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="category" value="Category" />
                                        <select
                                            id="category"
                                            name="category"
                                            value={data.category}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                        className="mt-1 block w-full"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        multiple
                                        disabled={data.images.length >= 3}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {data.images.length}/3 images selected. {data.images.length >= 3 ? 'Maximum reached.' : ''}
                                    </p>
                                    <InputError message={errors.images} className="mt-2" />
                                    
                                    {/* Image previews */}
                                    {previews.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img 
                                                        src={preview} 
                                                        alt={`Preview ${index + 1}`} 
                                                        className="w-32 h-32 object-cover rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute bottom-0 left-0 bg-primary text-white text-xs px-2 py-1 rounded-tr-md">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-end">
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