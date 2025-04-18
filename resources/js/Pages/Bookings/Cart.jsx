import React from 'react';
import { usePage, useForm, router, Link } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import CartCardProduct from '@/Components/CartCardProduct';
import { formatRupiah } from '@/utils';
import Footer from '@/Layouts/Footer';

export default function Cart() {
    const { cartItems, totalCost, auth } = usePage().props;
    const { post, processing, data, setData } = useForm({
        userName: auth.user.name
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
    console.log(cartItems);
    

    return (
        <>
            <Navbar />
            {cartItems.length > 0 ? (
                <article className='section-container mt-2 flex flex-col gap-6 laptop:flex-row laptop:gap-24 laptop:mt-8'>
                    {/* Product Section */}
                    <section className='flex flex-col gap-3 laptop:w-3/4'>
                        <h1 className='text-lg font-bold text-primary md:text-2xl'>Product</h1>
                        <div className='flex flex-col gap-4'>
                            {cartItems.map((item, i) => (
                                <CartCardProduct 
                                    key={i}
                                    productName={item.product.name}
                                    productQuantity={item.quantity}
                                    startDate={item.start_date}
                                    endDate={item.end_date}
                                    dayPrice={item.product.price_per_day}
                                    totalPrice={item.rental_cost}
                                />
                            ))}
                        </div>
                    </section>
                    
                    <div className='flex flex-col w-full laptop:w-2/4 gap-8'>
                        {/* Personal detail section */}
                        <section className='flex flex-col gap-3' >
                            <h1 className='text-lg font-bold text-primary md:text-2xl'>Data Diri</h1>
                            <div className='flex gap-6 border border-thrid/10 p-6 rounded-xl text-dark'>
                                <div className='flex flex-col gap-2'>
                                    <span>Nama</span>
                                    <span>No Hp</span>
                                    <span>Metode</span>
                                    <span>Alamat</span>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <p>{auth.user.name}</p>
                                    <p>{cartItems[0].phone_number}</p>
                                    <p>{cartItems[0].pickup_method}</p>
                                    <p>{cartItems[0].pickup_address}</p>
                                </div>
                            </div>
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
                            <button onClick={ handleCheckout} className='w-full bg-primary text-white py-3 rounded-xl'>Checkout</button>
                        </section>
                    </div>
                </article>
            ) : (
                <p>Your cart is empty</p>
            )}
            

            <Footer />
        </>
    );
}