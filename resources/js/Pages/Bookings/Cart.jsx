import React from 'react';
import { usePage, useForm, router, Link } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import CartCardProduct from '@/Components/CartCardProduct';
import { formatRupiah } from '@/utils';
import Footer from '@/Layouts/Footer';

export default function Cart() {
    const { cartItems, totalCost, auth } = usePage().props;
    const { post, processing, data, setData } = useForm({
        userName: cartItems.length > 0 ? cartItems[0].user_name : auth.user.name
    }); 

    const handleCheckout = () => {
        post(route('checkout'), {
            onSuccess: (response) => {
                const orderId = response.props.order.id;
                router.visit(`/checkout/${orderId}`);
            },
            onError: (errors) => console.log('Errors:', errors),
        });
    };
    
    return (
        <>
            <Navbar />
            {cartItems.length > 0 ? (
                <article className='section-container mt-2 flex flex-col gap-6 laptop:flex-row laptop:gap-24 laptop:mt-8'>
                    {/* Product Section */}
                    <section className='flex flex-col gap-3 laptop:w-3/4'>
                        <h1 className='text-lg font-bold text-primary md:text-2xl'>Product</h1>
                        <div className='flex flex-col gap-4'>
                            {cartItems.map((item, index) => (
                                <CartCardProduct
                                    key={index}
                                    image={item.product.images?.[0]?.image_path}
                                    productName={item.product.name}
                                    productQuantity={item.quantity}
                                    startDate={item.start_date}
                                    endDate={item.end_date}
                                    dayPrice={item.product.has_active_discount ? item.product.discounted_price : item.product.price_per_day}
                                    originalPrice={item.product.price_per_day}
                                    hasDiscount={item.product.has_active_discount}
                                    discountPercentage={item.product.discount_percentage}
                                    totalPrice={item.rental_cost}
                                />
                            ))}
                        </div>
                    </section>
                    
                    <div className='flex flex-col w-full laptop:w-2/4 gap-8'>
                        {/* Personal detail section */}
                        <section className='flex flex-col gap-3' >
                            <h1 className='text-lg font-bold text-primary md:text-2xl'>Data Diri</h1>
                            {cartItems.map((item, i) => (
                                <div key={i} className='flex gap-6 border border-thrid/10 p-6 rounded-xl text-dark mb-3'>
                                    <div className='flex flex-col gap-2'>
                                        <span className='font-semibold'>{item.product.name}</span>
                                        <span>Nama</span>
                                        <span>No Hp</span>
                                        <span>Metode</span>
                                        <span>Alamat</span>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span>&nbsp;</span>
                                        <p>{item.user_name}</p>
                                        <p>{item.phone_number}</p>
                                        <p>{item.pickup_method}</p>
                                        <p>{item.pickup_address}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Total Price section */}
                        <section className='flex flex-col gap-4'>
                            <h1 className='text-lg font-bold text-primary md:text-2xl'>Total Price</h1>
                            <hr className='my-2'/>
                            <div className='flex flex-col gap-2'>
                                {cartItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className='flex justify-between'
                                    >
                                        <span>{item.product.name}</span>
                                        <p>{formatRupiah(item.rental_cost)}</p>
                                    </div>
                                ))}
                                <div className='flex justify-between text-secondary font-bold mt-2'>
                                    <span>Order total</span>
                                    <p>{formatRupiah(totalCost)}</p>
                                </div>
                            </div>
                            <button onClick={handleCheckout} className='w-full bg-primary text-white py-3 rounded-xl'>Checkout</button>
                        </section>
                    </div>
                </article>
            ) : (
                <p className='h-screen'>Your cart is empty</p>
            )}
            
            <Footer />
        </>
    );
}