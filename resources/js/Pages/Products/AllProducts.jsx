    import React, { useState } from 'react';
    import { usePage, router, Head } from '@inertiajs/react';
    import BookingForms from '../Bookings/BookingForms';
    import Navbar from '@/Layouts/Navbar';


    export default function AllProducts() {
        const { products, filters, categories, cameraTypes, brands } = usePage().props;
        const [showBookingForm, setShowBookingForm] = useState(false);
        const [selectedProduct, setSelectedProduct] = useState(null);
        const [isAddToCart, setIsAddToCart] = useState(false);

        const handleFilterChange = (key, value) => {
            router.get('/products', { ...filters, [key]: value }, { preserveState: true });
        };

        const handleBooking = (product, addToCart = false) => {
            setSelectedProduct(product);
            setIsAddToCart(addToCart);
            setShowBookingForm(true);
        };

        const handleCloseForm = () => {
            setShowBookingForm(false);
            setSelectedProduct(null);
        };

        console.log(selectedProduct);
        

        return (
            <div className="container">
                <Head title='Products'/>
                <Navbar/>
                <h1>Semua Products</h1>
                <div className="filters">
                    <div>
                        <h3>Kategori</h3>
                        <label>
                            <input
                                type="radio"
                                name="category"
                                value=""
                                checked={!filters.category}
                                onChange={() => handleFilterChange('category', '')}
                            />
                            Semua
                        </label>
                        {categories.map(category => (
                            <label key={category}>
                                <input
                                    type="radio"
                                    name="category"
                                    value={category}
                                    checked={filters.category === category}
                                    onChange={() => handleFilterChange('category', category)}
                                />
                                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            </label>
                        ))}
                    </div>


                    <div className={`${filters.category === 'camera' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <h3>Jenis Kamera</h3>
                        <label>
                            <input
                                type="radio"
                                name="camera_type"
                                value=""
                                checked={!filters.camera_type}
                                onChange={() => handleFilterChange('camera_type', '')}
                            />
                            Semua
                        </label>
                        {cameraTypes.map(type => (
                            <label key={type}>
                                <input
                                    type="radio"
                                    name="camera_type"
                                    value={type}
                                    checked={filters.camera_type === type}
                                    onChange={() => handleFilterChange('camera_type', type)}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </label>
                        ))}
                    </div>
        

                    <div>
                        <h3>Merek</h3>
                        <label>
                            <input
                                type="radio"
                                name="brand"
                                value=""
                                checked={!filters.brand}
                                onChange={() => handleFilterChange('brand', '')}
                            />
                            Semua
                        </label>
                        {brands.map(brand => (
                            <label key={brand}>
                                <input
                                    type="radio"
                                    name="brand"
                                    value={brand}
                                    checked={filters.brand === brand}
                                    onChange={() => handleFilterChange('brand', brand)}
                                />
                                {brand.charAt(0).toUpperCase() + brand.slice(1)}
                            </label>
                        ))}
                    </div>

                    <div>
                        <h3>Cari</h3>
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="products">
                    {products.map(product => (
                        <div key={product.id} className="product-item">
                            <a href={`/products/${product.id}`}>
                                <h2>{product.name}</h2>
                                {product.images.length > 0 && (
                                    <img src={product.images[0].image_path} alt={product.name} />
                                )}
                                <p>Price: Rp {product.price_per_day}</p>
                                <p>Stock: {product.stock}</p>
                            </a>
                            <button className='border p-2 bg-indigo-200 text-white' onClick={() => handleBooking(product, true)}>Add to Cart</button>
                            <button className='border p-2 bg-indigo-200 text-white' onClick={() => handleBooking(product, false)}>Book Now</button>
                        </div>
                    ))}
                </div>

                {showBookingForm && selectedProduct && (
                    <BookingForms
                        product={selectedProduct}
                        onClose={handleCloseForm}
                        isAddToCart={isAddToCart}
                    />
                )}
            </div>
        );
    }