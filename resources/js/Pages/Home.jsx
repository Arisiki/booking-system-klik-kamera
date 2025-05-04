import BookingSekarangIcon from '@/Components/BookingSekarangIcon'
import Button from '@/Components/Button'
import CardProduct from '@/Components/CardProduct'
import { brandLogos } from '@/data'
import Footer from '@/Layouts/Footer'
import Navbar from '@/Layouts/Navbar'
import { router, usePage } from '@inertiajs/react'
import React, { useState } from 'react'
import BookingForms from './Bookings/BookingForms'

const Home = () => {
  const { products } = usePage().props;
  console.log(products);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddToCart, setIsAddToCart] = useState(false);

  const user = usePage().props.auth.user;

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
  

  return (
    <main>
      <Navbar/>
      <article className=''>
        <img src="/image-1.svg" alt="image-1" className='hidden absolute md:block left-0 h-[255px] laptop:h-[330px] top-80 lg:h-fit'/>
        <img src="/image-2.svg" alt="image-2" className='absolute h-[198px] laptop:h-[320px] right-0 lg:h-fit top-20' />
        {/* Hero section */}
        <section className='w-full mt-4 relative md:max-w-[587px] laptop:max-w-[891px] md:mx-auto laptop:mt-20 section-container'>
          <div className='max-w-[68dvw] flex flex-col gap-8 md:gap-11'>
            <div className='flex flex-col gap-4 md:gap-5'>
              <h1 className='text-primary text-[38px] leading-10 font-bold md:text-[52px] md:leading-[63px] md:text-center laptop:text-[64px] capitalize'>
                Tempat sewa kamera terlengkap dan termurah di bali.
              </h1>
              <p className='text-thrid text-sm leading-[17px] md:text-xl md:text-center laptop:max-w-[587px] md:mx-auto laptop:text-2xl'>
                Tersedia semua jenis alat mulai dari Kamera, Lensa dan Aksesoris Lainnya
              </p>
            </div>
            <BookingSekarangIcon className={'hidden md:block absolute bottom-12 right-12 laptop:right-44'}/>
            <Button
              title={'Lihat Semua Produk'}
              className={'px-[35px] py-[17px] bg-primary text-white font-bold rounded-xl max-w-[299px] md:mx-auto md:text-xl laptop:text-2xl laptop:py-6 laptop:px-10 laptop:max-w-fit'}
            />
          </div>
        </section>

        {/* Brands Section */}
        <section className='mt-28 md:mt-40 lg:mt-60 bg-[#F1F5F9] py-8'>
          <div className='flex flex-wrap gap-14 laptop:gap-28 justify-center items-center'>
            {brandLogos.map((brand) => (
              <img src={brand.path} alt="" key={brand.name} className='grayscale w-36 opacity-50'/>
            ))}
          </div>
        </section>


        {/* Products Recomentadion Section */}
        <section className='bg-primary py-8 md:py-12 flex flex-col gap-4 md:gap-8 '>
          <h1 className='text-white text-2xl md:text-3xl text-center font-semibold'>REKOMENDASI BUAT KAMU</h1>
            <div className='grid grid-cols-2 minitab:grid-cols-3 md:grid-cols-4 gap-8 section-container'>
              {products.map((product) => (
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
        </section>
      </article>
      {showBookingForm && selectedProduct && (
          <BookingForms
              product={selectedProduct}
              onClose={handleCloseForm}
              isAddToCart={isAddToCart}
          />
      )}
      <Footer/>
    </main>
  )
}

export default Home