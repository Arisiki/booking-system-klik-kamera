import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function EditProduct({ product }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        price_per_day: product.price_per_day || '',
        stock: product.stock || '',
        category: product.category || '',
        brand: product.brand || '',
        camera_type: product.camera_type || '',
        image: null,
        _method: 'PUT',
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (product.image_path) {
            setPreview(`/storage/${product.image_path}`);
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.products.update', product.id));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit Product: ${product.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Edit Product: {product.name}</h1>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Product Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="category" value="Category" />
                                        <select
                                            id="category"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Camera">Camera</option>
                                            <option value="Lens">Lens</option>
                                            <option value="Accessory">Accessory</option>
                                            <option value="Lighting">Lighting</option>
                                        </select>
                                        <InputError message={errors.category} className="mt-2" />
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="brand" value="Brand" />
                                        <TextInput
                                            id="brand"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.brand} className="mt-2" />
                                    </div>
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="camera_type" value="Camera Type (if applicable)" />
                                    <TextInput
                                        id="camera_type"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.camera_type}
                                        onChange={(e) => setData('camera_type', e.target.value)}
                                    />
                                    <InputError message={errors.camera_type} className="mt-2" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="price_per_day" value="Price Per Day (Rp)" />
                                        <TextInput
                                            id="price_per_day"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.price_per_day}
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
                                            className="mt-1 block w-full"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.stock} className="mt-2" />
                                    </div>
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="image" value="Product Image" />
                                    <input
                                        id="image"
                                        type="file"
                                        className="mt-1 block w-full"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <InputError message={errors.image} className="mt-2" />
                                    
                                    {preview && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                                            <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-end">
                                    <PrimaryButton type="submit" className="ml-4" disabled={processing}>
                                        Update Product
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