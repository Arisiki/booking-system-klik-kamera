import BookingSekarangIcon from '@/Components/BookingSekarangIcon'
import Button from '@/Components/Button'
import CardProduct from '@/Components/CardProduct'
import { brandLogos, orderProcess, testimonials } from '@/data'
import Footer from '@/Layouts/Footer'
import Navbar from '@/Layouts/Navbar'
import { router, usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import BookingForms from './Bookings/BookingForms'
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Home = () => {
  const { products } = usePage().props;
  console.log(products);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddToCart, setIsAddToCart] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  useEffect(() => {
    const timer = 
      setInterval(() => {
        setCurrentTestimonial((prev) =>
          prev === testimonials.length - 1 ? 0 : prev + 1
        )
      }, 5000);

      return () => clearInterval(timer);
  }, [])
  
  const handleNextTestimonial = (direction) => {
    if(direction === 'right') {
      setCurrentTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      )
    } else if (direction === 'left') {
      setCurrentTestimonial((prev) =>
        prev === 0 ? testimonials.length - 1 : prev - 1
      )
    }
  }
  
  return (
      <main>
        <Navbar/>
          <article>
            <img src="/image-1.svg" alt="image-1" className='hidden absolute md:block left-0 h-[255px] laptop:h-[330px] top-80 lg:h-fit'/>
            <img src="/image-2.svg" alt="image-2" className='absolute h-[198px] laptop:h-[320px] right-0 lg:h-fit top-24' />
            {/* Hero section */}
            <section className='w-full mt-4 relative flex md:justify-center laptop:max-w-[891px] laptop:mt-20 section-container'>
              <div className='max-w-[68dvw] flex flex-col gap-8 md:gap-11'>
                <div className='flex flex-col gap-4 md:gap-5'>
                  <h1 className='text-primary text-[38px] leading-10 font-bold md:text-[52px] md:leading-[63px] md:text-center laptop:text-[64px] capitalize'>
                    Tempat sewa kamera terlengkap dan termurah di bali.
                  </h1>
                  <p className='text-thrid text-sm leading-[17px] md:text-xl md:text-center laptop:max-w-[587px] md:mx-auto'>
                    Tersedia semua jenis alat mulai dari Kamera, Lensa dan Aksesoris Lainnya
                  </p>
                </div>
                <BookingSekarangIcon className={'hidden md:block absolute bottom-12 right-40'}/>
                <Button
                  title={'Lihat Semua Produk'}
                  className={'px-[35px] py-[17px] bg-primary text-white font-bold rounded-xl max-w-[299px] md:mx-auto md:text-xl laptop:text-2xl laptop:py-6 laptop:px-10 laptop:max-w-fit'}
                  to={'/products'}
                />
              </div>
            </section>

            {/* Brands Section */}
            <section className='mt-28 md:mt-40 lg:mt-60 bg-[#F1F5F9] py-8'>
              <div className='flex flex-wrap justify-center gap-8 md:justify-between items-center section-container'>
                {brandLogos.map((brand) => (
                  <img src={brand.path} alt="" key={brand.name} className='grayscale w-20 md:w-28 laptop:w-36 opacity-50'/>
                ))}
              </div>
            </section>


            {/* Products Recomentadion Section */}
            <section className='bg-primary py-12 md:py-12 flex flex-col gap-4 md:gap-8 '>
              <h1 className='text-white text-2xl md:text-3xl text-center font-semibold'>REKOMENDASI BUAT KAMU</h1>
                <div className='grid grid-cols-2 minitab:grid-cols-3 md:grid-cols-4 gap-8 section-container w-full'>
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

            {/* Review section */}
            <section className='bg-[#F1F5F9] w-full h-fit py-12'>
              <div className='flex items-center section-container'>
                <button onClick={() => handleNextTestimonial('left')}>
                  <FiChevronLeft className='hidden md:block w-12 h-12 text-primary'/>
                </button>
                <div className='flex flex-col laptop:flex-row items-center md:section-container justify-center md:justify-start gap-8 laptop:gap-20'>
                  <div className='w-full  flex justify-center md:justify-start relative'>
                    <div className='w-[268px] md:w-[480px] md:h-[480px] h-[268px] overflow-hidden flex items-center rounded-xl'>
                      <img src={testimonials[currentTestimonial].image} alt="testi-1-image" className='w-full h-full object-cover' />
                    </div>
                    <div className='w-[112px] md:w-[189px] md:h-[120px] h-[80px] overflow-hidden rounded-xl p-4 bg-white border-4 border-secondary border-dashed absolute flex items-center right-0 md:-right-10  top-8 md:top-16'>
                      <img src={testimonials[currentTestimonial].avatar} alt="avatar"  className='absolute top-0 left-0' />
                    </div>
                  </div>
                  
                  <div className='flex flex-col items-center  gap-4 md:items-start'>
                      <h1 className='uppercase text-xl font-semibold'>APA KATA MEREKA</h1>
                      <p className='text-lg md:text-2xl text-thrid text-center md:text-start'>
                        {testimonials[currentTestimonial].message}
                      </p>
                      <div className='text-center md:text-start'>
                        <h2 className='text-dark'>{testimonials[currentTestimonial].name}</h2>
                        <span className='text-dark font-bold'>{testimonials[currentTestimonial].role}</span>
                      </div>
                      <div className='flex gap-3 mt-10'>
                        {testimonials.map((_, i) => (
                          <button
                            key={i}
                            className={`transition-all ${i === currentTestimonial ? 'w-8 bg-primary' : 'w-2 bg-thrid/40'} h-2 rounded-full`}
                            onClick={() => setCurrentTestimonial(i)}
                          />
                        ))}
                      </div>
                  </div>
                </div>
                <button onClick={() => handleNextTestimonial('right')}>
                  <FiChevronRight className='hidden md:block w-12 h-12 text-primary'/>
                </button>
              </div>
            </section>

            {/* How to booking */}
            <section className='py-12'>
              <div className='section-container flex flex-col gap-8 laptop:gap-16'>
                <div className='text-center flex flex-col gap-4'>
                  <h1 className='text-2xl md:text-3xl laptop:text-4xl uppercase font-bold'>Cara Booking Yang Simpel</h1>
                  <p className='text-third md:text-lg'>Langkah-langkah booking di Klik Kamera</p>
                </div>

                <div className='flex flex-col md:flex-row md:items-start w-full gap-6 md:gap-16'>
                  <img src="/phone.svg" alt="" className='md:w-1/2 laptop:max-w-[617px]' />
                  <div className='flex flex-col gap-4 md:gap-6 laptop:gap-8'>
                    {orderProcess.map((proces) => (
                      <details className='border-l-4 pl-4 border-third group transition-all duration-300 [&[open]]:border-primary'>
                        <summary className='text-lg md:text-xl laptop:text-2xl font-semibold list-none cursor-pointer'>
                          {proces.title}
                        </summary>
                        <p className='text-thrid mt-2'>
                          {proces.description}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
                  
                <div className='w-full relative text-center'>
                  <BookingSekarangIcon className={'hidden md:block absolute bottom-12 right-24 laptop:right-[300px]'}/>
                  <Button
                    title={'Lihat Semua Produk'}
                    className={'px-[35px] py-[17px] bg-primary text-white font-bold rounded-xl max-w-[299px] md:mx-auto md:text-xl laptop:text-2xl laptop:py-6 laptop:px-10 laptop:max-w-fit'}
                    to={'/products'}
                  />
                </div>
              </div>
            </section>


          </article>
          { showBookingForm && selectedProduct && (
              <div>
                    <BookingForms
                      product={selectedProduct}
                      onClose={handleCloseForm}
                      isAddToCart={isAddToCart}
                  />
                  <div className='fixed bg-primary/50 backdrop-blur-sm left-0 z-40 top-0 right-0 bottom-0'/>
              </div>
          )}
        <Footer/>
    </main>
  )
}

export default Home