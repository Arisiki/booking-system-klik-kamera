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
                            <hr className='my-2' />
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
                <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4'>
                    <div className="w-80 h-80 mb-6">
                        <img src="/empty-cart.svg" alt="Empty Cart" className="w-full h-full object-contain" />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Keranjang Belanja Kosong</h2>
                    <p className='text-gray-500 mb-8 max-w-md'>
                        Sepertinya anda belum menambahkan produk apapun ke keranjang. Yuk cari kamera impianmu sekarang!
                    </p>
                    <Link
                        href={route('products.index')}
                        className='px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    >
                        Mulai Belanja
                    </Link>
                </div>
            )}

            <Footer />
        </>
    );
}