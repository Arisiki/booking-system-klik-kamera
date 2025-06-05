import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

export default function EditProduct({ product }) {
    // Update form data to handle multiple images
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        price_per_day: product.price_per_day || '',
        stock: product.stock || '',
        category: product.category || '',
        brand: product.brand || '',
        camera_type: product.camera_type || '',
        images: [], // For new images
        remove_images: [], // For images to remove
        _method: 'PUT',
    });

    // State for existing images and previews
    const [existingImages, setExistingImages] = useState(product.images || []);
    const [previews, setPreviews] = useState([]);

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
            } else if (key === 'remove_images') {
                data.remove_images.forEach(imageId => {
                    formData.append('remove_images[]', imageId);
                });
            } else {
                formData.append(key, data[key]);
            }
        });

        post(route('admin.products.update', product.id), {
            data: formData,
            onSuccess: () => {
                // Reset new images and previews on success
                setData('images', []);
                setPreviews([]);
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                if (errors.error) {
                    alert(errors.error);
                } else {
                    alert('Failed to update product. Please try again.');
                }
            }
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Check if adding these images would exceed the limit
        if (existingImages.length - data.remove_images.length + files.length > 3) {
            alert('Maximum 3 images allowed');
            return;
        }
        
        setData('images', [...data.images, ...files]);
        
        // Generate previews for new images
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeExistingImage = (imageId) => {
        setData('remove_images', [...data.remove_images, imageId]);
    };

    const removeNewImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
        
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const setAsPrimary = (imageId) => {
        const updatedImages = existingImages.map(img => ({
            ...img,
            is_primary: img.id === imageId
        }));
        setExistingImages(updatedImages);
        
        // Update on server
        axios.post(route('admin.products.set-primary-image', [product.id, imageId]));
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
                                    <InputLabel htmlFor="images" value="Add New Images" />
                                    <input
                                        id="images"
                                        type="file"
                                        className="mt-1 block w-full"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        multiple
                                        disabled={(existingImages.length - data.remove_images.length + data.images.length) >= 3}
                                    />
                                    <InputError message={errors.images} className="mt-2" />
                                    
                                    {/* Remove the old preview check and use the new previews array */}
                                    {previews.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img 
                                                        src={preview} 
                                                        alt={`New Preview ${index + 1}`} 
                                                        className="w-32 h-32 object-cover rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                    <span className="absolute bottom-0 left-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-tr-md">
                                                        New
                                                    </span>
                                                </div>
                                            ))}
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