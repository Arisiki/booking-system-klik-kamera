import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';
import { formatRupiah, useScrollTop } from '@/utils';
import { set } from 'date-fns';
import { IoIosBatteryFull, IoIosCamera } from 'react-icons/io';
import { BsFillBagCheckFill } from "react-icons/bs";
import { GiCharging } from "react-icons/gi";
import { RiCameraLensAiLine } from "react-icons/ri";
import { FaGear } from "react-icons/fa6";
import IconPlaceholder from '@/Components/IconPlaceholder';
import { BiSolidCategory } from "react-icons/bi";
import { MdDiscount } from "react-icons/md";
import { LuContainer } from "react-icons/lu";
import Footer from '@/Layouts/Footer';

export default function DetailProduct() {
    const { product } = usePage().props;
    const user = usePage().props.auth.user
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [isAddToCart, setIsAddToCart] = useState(false);

    // Fungsi untuk mengecek apakah produk sedang diskon
    const hasActiveDiscount = () => {
        if (!product?.discount_percentage || !product?.discount_start_date || !product?.discount_end_date) {
            return false;
        }
        
        const now = new Date();
        const startDate = new Date(product.discount_start_date);
        const endDate = new Date(product.discount_end_date);
        
        return now >= startDate && now <= endDate;
    };

    // Fungsi untuk menghitung harga setelah diskon
    const getDiscountedPrice = () => {
        if (!hasActiveDiscount()) return product.price_per_day;
        return product.price_per_day - (product.price_per_day * product.discount_percentage / 100);
    };

    // Fungsi untuk menghitung penghematan
    const getSavings = () => {
        if (!hasActiveDiscount()) return 0;
        return product.price_per_day - getDiscountedPrice();
    };

    const handleBooking = (addToCart = false) => {
        if(!user) return router.visit(route('login'));
        setIsAddToCart(addToCart);
        setShowBookingForm(true);
        
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
    };

    const [productImages, setProductImages] = useState(product.images)
    const [activeImage, setActiveImage] = useState(productImages[0].image_path)
    const hasActiveImage = productImages.some((img) => img.is_active);

    const handleImageClick = (image) => {
        setActiveImage(image.image_path)

        const updatedImages = productImages.map((img) => ({
            ...img,
            is_active: img.id === image.id
        }));
        setProductImages(updatedImages);
    }

    useScrollTop([showBookingForm]);
    console.log(activeImage);
    

    return (
        <main>
            <Navbar/>
            <article className="section-container laptop:mt-10 gap-8">

                <div className='flex flex-col gap-6 laptop:flex-row laptop:justify-between' >
                    <section className='w-full flex flex-col gap-2 md:flex-row md:gap-4 laptop:w-1/2 laptop:justify-bertween items-center laptop:items-start'>
                        {/* Discount Badge pada gambar */}
                        <div className='relative'>
                            <img src={`/storage/${activeImage}`} alt="" className='rounded-xl md:order-2 w-[361px] object-cover md:w-[531px] laptop:w-4/5 h-fit' />
                            {hasActiveDiscount() && (
                                <div className='absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-lg shadow-lg'>
                                    -{product.discount_percentage}% OFF
                                </div>
                            )}
                        </div>
                        <div className='flex flex-row md:flex-col gap-4 justify-around w-full md:justify-start md:w-fit'>
                            {productImages.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => handleImageClick(img)}
                                    disabled={img.image_path === activeImage}
                                    className={`${(img.is_active || !hasActiveImage && img.is_primary ) && 'border-2 border-primary/30'} p-2 rounded-2xl max-w-[95px] md:max-w-[149px] laptop:w-[110px]`}
                                >
                                    <img src={`/storage/${img.image_path}`} className='w-full h-full rounded-xl'/>
                                </button>
                            ))}
                        </div>
                    </section>
                    
                    <section className='flex flex-col gap-4  laptop:w-2/5 lg:w-1/2'>
                        <div className='flex flex-col md:gap-4'>
                            <h1 className='text-primary font-bold text-[40px] md:text-5xl'>
                                {product.name}
                            </h1>
                            
                            {/* Price Display with Discount */}
                            <div className='flex flex-col gap-2'>
                                {hasActiveDiscount() ? (
                                    <>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-secondary font-bold text-2xl md:text-3xl'>
                                                {formatRupiah(getDiscountedPrice())}/Day
                                            </span>
                                            <span className='bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold'>
                                                -{product.discount_percentage}% OFF
                                            </span>
                                        </div>
                                        <div className='text-lg text-gray-500 line-through'>
                                            {formatRupiah(product.price_per_day)}/Day
                                        </div>
                                        <div className='text-sm text-green-600 font-medium'>
                                            Hemat {formatRupiah(getSavings())} per hari!
                                        </div>
                                    </>
                                ) : (
                                    <span className='text-secondary font-bold text-2xl md:text-3xl'>
                                        {formatRupiah(product.price_per_day)}/Day
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                            {product.equipment.map((equ) => (
                                <div key={equ.id} className='h-16 px-3 py-4 text-thrid bg-acccent rounded-md flex items-center gap-4'>
                                    <div className='text-2xl'>
                                        {equ.name.toLowerCase().includes('baterai')
                                            ? <IoIosBatteryFull />
                                            : equ.name.toLowerCase().includes('tas')
                                            ? <BsFillBagCheckFill />
                                            : equ.name.toLowerCase().includes('charger')
                                            ? <GiCharging />
                                            : equ.name.toLowerCase().includes('lensa')
                                            ? <RiCameraLensAiLine />
                                            : equ.name.toLowerCase().includes('kamera')
                                            ? <IoIosCamera />
                                            : <FaGear/>
                                        }
                                    </div>
                                    <div className='text-sm'>
                                        <span className='opacity-30'>
                                            {equ.name}
                                        </span>
                                        <br />
                                        <span>
                                            {equ.pivot.quantity} Unit
                                        </span>
                                    </div>
                                    
                                </div>
                            ))
                            }
                        </div>
                        
                        <div className='flex flex-col gap-8 md:gap-10'>
                            {/* Description */}
                            <div className='flex flex-col'>
                                <h2 className='text-primary md:text-lg'>Deskripsi</h2>
                                <p className='text-sm text-thrid/50 md:text-base'>
                                    {product.description}
                                </p>
                            </div>
                            
                            {/* Discount Information */}
                            {hasActiveDiscount() && (
                                <div className='bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <MdDiscount className='text-red-500 text-xl'/>
                                        <h3 className='text-red-700 font-bold'>Promo Spesial!</h3>
                                    </div>
                                    <p className='text-sm text-red-600 mb-2'>
                                        Dapatkan diskon {product.discount_percentage}% untuk produk ini!
                                    </p>
                                    <div className='text-xs text-red-500'>
                                        Berlaku hingga: {new Date(product.discount_end_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {/* Buttons */}
                            <div className='flex flex-col font-bold gap-4 md:flex-row'>
                                <button
                                    className='w-full text-center py-4 bg-primary text-white font-bold rounded-md'
                                    onClick={() => handleBooking(false)}
                                >
                                    {hasActiveDiscount() ? `Book Now - ${formatRupiah(getDiscountedPrice())}/Day` : 'Book Now'}
                                </button>
                                <button
                                    className='w-full text-center py-4 text-primary border border-primary font-bold rounded-md'
                                    onClick={() => handleBooking(true)}
                                >
                                    Add to cart
                                </button>
                            </div>
                            {/* Categories */}
                            <div className='flex justify-around md:justify-between'>
                                <div className='flex flex-col justify-center md:flex-row md:gap-4'>
                                    <IconPlaceholder
                                        className={'w-14 h-14 opacity-60'}
                                        iconImage={<BiSolidCategory className='w-6 h-6'/>}
                                    />
                                    <div className='flex flex-col items-center md:items-start justify-center'>
                                        <h2  className='text-thrid/60 text-sm text-center mt-4 md:mt-0 md:text-base'>
                                            Kategori
                                        </h2>
                                        <span className='text-primary text-sm text-center font-bold md:text-base'>
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center md:flex-row md:gap-4'>
                                    <IconPlaceholder
                                        className={'w-14 h-14 opacity-60'}
                                        iconImage={<MdDiscount className='w-6 h-6'/>}
                                    />
                                    <div className='flex flex-col items-center md:items-start  justify-center'>
                                    <h2  className='text-thrid/60 text-sm text-center mt-4 md:mt-0 md:text-base'>
                                        Brand
                                    </h2>
                                    <span className='text-primary text-sm text-center font-bold md:text-base'>
                                        {product.brand}
                                    </span>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center md:flex-row md:gap-4'>
                                    <IconPlaceholder
                                        className={'w-14 h-14 opacity-60'}
                                        iconImage={<LuContainer className='w-6 h-6'/>}
                                    />
                                    <div className='flex flex-col items-center md:items-start justify-center'>
                                        <h2  className='text-thrid/60 text-sm text-center mt-4 md:mt-0  md:text-base'>
                                            Stok
                                        </h2>
                                        <span className='text-primary text-sm text-center font-bold  md:text-base'>
                                            {product.stock} unit
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </section>

                </div>
                {/* Reviews */}
                <section className='flex flex-col gap-4 mt-8'>
                    <h2 className='text-primary font-bold text-xl'>Reviews</h2>
                    {product.reviews && product.reviews.length > 0 ? (
                    <div>
                        {product.reviews.map((review) => (
                            <div key={review.id} className="mb-4 p-4 border rounded">
                                <p className="font-bold">{review.user.name}</p>
                                <p className='text-yellow-400'>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                <p>Comment: {review.comment || 'No comment'}</p>
                                <p className="text-sm text-thrid/60">
                                    Reviewed on {new Date(review.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-thrid/70'>Masih belum ada review untuk produk ini.</p>
                )}
                </section>
            </article>
            
            <Footer />
            { showBookingForm && (
                <div>
                    <BookingForms
                        product={product}
                        onClose={handleCloseForm}
                        isAddToCart={isAddToCart}
                    />
                    <div className='fixed bg-primary/50 backdrop-blur-sm left-0 z-40 top-0 right-0 bottom-0'/>
                </div>
            )}
        </main>
    );
}
