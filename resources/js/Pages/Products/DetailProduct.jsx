import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import BookingForms from '../Bookings/BookingForms';
import Navbar from '@/Layouts/Navbar';
import { formatRupiah } from '@/utils';
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

    console.log('product detail', product);
    

    return (
        <>
            <Navbar/>
            <article className="section-container laptop:mt-10 gap-8">

                <div className='flex flex-col gap-6 laptop:flex-row laptop:justify-between' >
                    <section className='w-full flex flex-col gap-2 md:flex-row md:gap-4 laptop:w-1/2 laptop:justify-bertween items-center laptop:items-start'>
                        <img src={'/icons/Kamera.svg'} alt="" className='w-full md:order-2 max-w-[361px] md:max-w-[531px] laptop:w-4/5' />
                        <div className='flex flex-row md:flex-col gap-4 justify-around w-full md:justify-start md:w-fit'>
                            {productImages.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => handleImageClick(img)}
                                    disabled={img.image_path === activeImage}
                                    className={`${(img.is_active || !hasActiveImage && img.is_primary ) && 'border-2 border-primary/30'} p-2 rounded-lg max-w-[95px] md:max-w-[149px] laptop:w-[110px]`}
                                >
                                    <img src={'/icons/Kamera.svg'} className='w-full h-full'/>
                                </button>
                            ))}
                        </div>
                    </section>
                    
                    <section className='flex flex-col gap-4  laptop:w-1/2'>
                        <div className='flex flex-col md:gap-4'>
                            <h1 className='text-primary font-bold text-[40px] md:text-5xl'>
                                {product.name}
                            </h1>
                            <span className='text-secondary font-bold text-2xl md:text-3xl'>
                                {formatRupiah(product.price_per_day)}/Day
                            </span>
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
                            {/* Buttons */}
                            <div className='flex flex-col font-bold gap-4 md:flex-row'>
                                <button
                                    className='w-full text-center py-4 bg-primary text-white font-bold rounded-md'
                                    onClick={() => handleBooking(false)}
                                >
                                    Book Now
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
                                <p className='text-yellow-400'>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
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
                









                {/* <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                <p>Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('_', ' ')}</p>
                {product.camera_type && (
                    <p>Jenis Kamera: {product.camera_type.charAt(0).toUpperCase() + product.camera_type.slice(1).replace('_', ' ')}</p>
                )}
                <p>Merek: {product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}</p>
                <p>Description: {product.description}</p>
                <p>Price per Day: Rp {product.price_per_day}</p>
                <p>Stock: {product.stock}</p>
                <div className="mb-4">
                    <h3 className="text-lg font-bold">Images:</h3>
                    {product.images.map(image => (
                        <img key={image.id} src={image.image_path} alt="Product Image" className="w-1/2 h-auto rounded mb-2" />
                    ))}
                </div>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => handleBooking(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add to Cart
                    </button>
                    <button
                        onClick={() => handleBooking(false)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Book Now
                    </button>
                </div> */}

                {showBookingForm && (
                    <BookingForms
                        product={product}
                        onClose={handleCloseForm}
                        isAddToCart={isAddToCart}
                    />
                )}

                {/* Bagian Ulasan */}
                {/* <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Product Reviews</h2>
                    {product.reviews && product.reviews.length > 0 ? (
                        <div>
                            {product.reviews.map((review) => (
                                <div key={review.id} className="mb-4 p-4 border rounded">
                                    <p className="font-bold">{review.user.name}</p>
                                    <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                    <p>Comment: {review.comment || 'No comment'}</p>
                                    <p className="text-sm text-gray-500">
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
                        <p>No reviews yet.</p>
                    )}
                </div> */}
            </article>
            <Footer />
        </>
    );
}