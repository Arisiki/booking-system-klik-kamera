import React, { useEffect, useState } from 'react';
import { usePage, router, Head, Link } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';
import Sidebar from '@/Components/Sidebar';
import Footer from '@/Layouts/Footer';
import { icons } from '@/data';
import CardProduct from '@/Components/CardProduct';
import { useScrollTop } from '@/utils';


export default function AllProducts() {
    const { products, filters, categories, cameraTypes, brands } = usePage().props;
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddToCart, setIsAddToCart] = useState(false);

    const user = usePage().props.auth.user;

    const handleFilterChange = (key, value) => {
        router.get('/products', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleBooking = (product, addToCart = false) => {
        if (!user) return router.visit('login');
        setSelectedProduct(product);
        setIsAddToCart(addToCart);
        setShowBookingForm(true);
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
        setSelectedProduct(null);
    };

    const [filterOpen, setFilterOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth >= 1280) {
                setFilterOpen(true)
            } else {
                setFilterOpen(false)
            }
        }

        handleResize();

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    useScrollTop([showBookingForm]);

    

    return (
            <main className='h-fit'>
                <Navbar/>
                <div className='relative mb-0' >
                <Head title='Products'/>
                <section className='flex flex-col gap-4 justify-between mt-4 section-container laptop:flex-row'>
                    {filterOpen && (
                        <Sidebar
                            filters={filters}
                            categories={categories}
                            cameraTypes={cameraTypes}
                            brands={brands}
                            handleFilterChange={handleFilterChange}
                            setFilterOpen={setFilterOpen}
                            className="absolute top-10 right-1/2 translate-x-1/2 bg-acccent z-40 w-[80%] laptop:w-[290px]    laptop:translate-x-0 laptop:static"
                        />
                    )}

                    <div className='flex flex-col gap-3 w-full'>

                        <div className='flex justify-between'>
                            <h1 className='text-lg font-bold text-primary md:text-xl laptop:text-2xl'>
                                Semua Products
                            </h1>
                            <button className='laptop:hidden' onClick={() => setFilterOpen(true)}>
                                <img src={icons.filter.path} alt={icons.filter.name} className='md:w-6' />
                            </button>
                        </div>
                        
                        {/* <div>
                            <h3>Cari</h3>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div> */}

                        {products && products.length > 0 ? (
                            <div className='grid grid-cols-2 gap-8 minitab:grid-cols-3 md:grid-cols-4 md:gap-4'>
                                {products.map(product => (
                                    <CardProduct
                                        key={product.id}
                                        product={product}
                                        productName={product.name}
                                        productPrice={product.price_per_day}
                                        bookNow={() => handleBooking(product, false)}
                                        addToCart={() => handleBooking(product, true)}
                                        productId={product.id}
                                        productImage={product.images}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center py-12 bg-gray-100 rounded-lg">
                                <p className="mb-4 text-lg text-gray-700">Produk belum tersedia/belum ditambahkan oleh admin.</p>
                            </div>
                        )}

                    </div>
                </section>
                
                </div>
                { filterOpen &&  (
                    <div className='absolute bg-primary/50 backdrop-blur-sm left-0 z-[35] top-0 right-0 bottom-0 laptop:hidden'/>
                )}
                { showBookingForm && selectedProduct && (
                    <div>
                         <BookingForms
                            product={selectedProduct}
                            onClose={handleCloseForm}
                            isAddToCart={isAddToCart}
                        />
                        <div className='fixed top-0 right-0 bottom-0 left-0 z-40 backdrop-blur-sm bg-primary/50'/>
                    </div>
                )}
                <Footer/>
            </main>
    );
}