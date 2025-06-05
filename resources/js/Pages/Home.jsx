import BookingSekarangIcon from '@/Components/BookingSekarangIcon'
import Button from '@/Components/Button'
import CardProduct from '@/Components/CardProduct'
import { brandLogos, orderProcess, testimonials } from '@/data'
import Navbar from '@/Layouts/Navbar'
import { router, usePage } from '@inertiajs/react'
import React, { useEffect, useState, lazy, Suspense } from 'react'
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useScrollTop } from '@/utils'

// Lazy load komponen yang tidak langsung terlihat
const BookingForms = lazy(() => import('./Bookings/BookingForms'));
const Footer = lazy(() => import('@/Layouts/Footer'));

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
  useScrollTop([showBookingForm]);

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
                <div className='flex flex-col gap-4 md:gap-5 laptop:gap-8'>
                  <h1 className='text-primary text-[38px] leading-10 font-bold md:text-[52px] md:leading-[63px] md:text-center laptop:text-[64px] capitalize'>
                    Tempat sewa kamera termurah di bali.
                  </h1>
                  <p className='text-thrid text-sm leading-[17px] md:text-xl md:text-center laptop:max-w-[587px] md:mx-auto'>
                    Tersedia semua jenis alat mulai dari Kamera, Lensa dan Aksesoris Lainnya
                  </p>
                </div>
                <BookingSekarangIcon className={'hidden absolute bottom-12 right-40 md:block'}/>
                <Button
                  title={'Lihat Semua Produk'}
                  className={'font-bold text-white rounded-xl px-[35px] py-[17px] bg-primary max-w-[299px] md:mx-auto md:text-xl laptop:text-2xl laptop:py-6 laptop:px-10 laptop:max-w-fit'}
                  to={'/products'}
                />
              </div>
            </section>

            {/* Brands Section */}
            <section className='mt-28 md:mt-60 lg:mt-80 bg-[#F1F5F9] py-8'>
              <div className='flex flex-wrap gap-8 justify-center items-center md:justify-between section-container'>
                {brandLogos.map((brand) => (
                  <img src={brand.path} alt="" key={brand.name} className='w-20 opacity-50 grayscale md:w-28 laptop:w-36'/>
                ))}
              </div>
            </section>


            {/* Products Recomentadion Section */}
            <section className='flex flex-col gap-4 py-12 bg-primary md:py-12 md:gap-8'>
              <h1 className='text-2xl font-semibold text-center text-white md:text-3xl'>REKOMENDASI BUAT KAMU</h1>
                {products && products.length > 0 ? (
                  <div className='grid grid-cols-2 gap-8 w-full minitab:grid-cols-3 md:grid-cols-4 section-container'>
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
                ) : (
                  <div className='flex flex-col justify-center items-center py-8 rounded-lg section-container bg-white/10'>
                    <p className='mb-4 text-lg text-white'>Produk belum tersedia/belum ditambahkan oleh admin.</p>
                  </div>
                )}
            </section>

            {/* Review section */}
            <section className='bg-[#F1F5F9] w-full h-fit py-12'>
              <div className='flex items-center section-container'>
                <button 
                  name='backward' 
                  onClick={() => handleNextTestimonial('left')}
                  aria-label="Previous testimonial"
                >
                  <FiChevronLeft className='hidden w-12 h-12 md:block text-primary'/>
                </button>
                <div className='flex flex-col gap-8 justify-center items-center laptop:flex-row md:section-container md:justify-start laptop:gap-20'>
                  <div className='flex relative justify-center w-full md:justify-start'>
                    <div className='w-[268px] md:w-[480px] md:h-[480px] h-[268px] overflow-hidden flex items-center rounded-xl'>
                      <img src={testimonials[currentTestimonial].image} alt="testi-1-image" className='object-cover w-full h-full' />
                    </div>
                    <div className='w-[112px] md:w-[189px] md:h-[120px] h-[80px] overflow-hidden rounded-xl p-4 bg-white border-4 border-secondary border-dashed absolute flex items-center right-0 md:-right-10  top-8 md:top-16'>
                      <img src={testimonials[currentTestimonial].avatar} alt="avatar"  className='absolute top-0 left-0' />
                    </div>
                  </div>
                  
                  <div className='flex flex-col gap-4 items-center md:items-start'>
                      <h1 className='text-xl font-semibold uppercase'>APA KATA MEREKA</h1>
                      <p className='text-lg text-center md:text-2xl text-thrid md:text-start'>
                        {testimonials[currentTestimonial].message}
                      </p>
                      <div className='text-center md:text-start'>
                        <h2 className='text-dark'>{testimonials[currentTestimonial].name}</h2>
                        <span className='font-bold text-dark'>{testimonials[currentTestimonial].role}</span>
                      </div>
                      <div className='flex gap-3 mt-10'>
                        {testimonials.map((testimonial, i) => (
                          <button
                            name='testimonial'
                            key={i}
                            className={`transition-all ${i === currentTestimonial ? 'w-8 bg-primary' : 'w-2 bg-thrid/40'} h-2 rounded-full`}
                            // onClick={() => setCurrentTestimonial(i)}
                            aria-label={`View testimonial from ${testimonial.name}`}
                            aria-current={i === currentTestimonial ? 'true' : 'false'}
                          />
                        ))}
                      </div>
                  </div>
                </div>
                <button 
                  name='forward' 
                  onClick={() => handleNextTestimonial('right')}
                  aria-label="Next testimonial"
                >
                  <FiChevronRight className='hidden w-12 h-12 md:block text-primary'/>
                </button>
              </div>
            </section>

            {/* How to booking */}
            <section className='py-12'>
              <div className='flex flex-col gap-8 section-container laptop:gap-16'>
                <div className='flex flex-col gap-4 text-center'>
                  <h1 className='text-2xl font-bold uppercase md:text-3xl laptop:text-4xl'>Cara Booking Yang Simpel</h1>
                  <p className='text-third md:text-lg'>Langkah-langkah booking di Klik Kamera</p>
                </div>

                <div className='flex flex-col gap-6 w-full md:flex-row md:items-start md:gap-16'>
                  <img src="/phone.svg" alt="" className='md:w-1/2 laptop:max-w-[617px]' />
                  <div className='flex flex-col gap-4 md:gap-6 laptop:gap-8'>
                    {orderProcess.map((proces) => (
                      <details key={proces} className='border-l-4 pl-4 border-third group transition-all duration-300 [&[open]]:border-primary'>
                        <summary className='text-lg font-semibold list-none cursor-pointer md:text-xl laptop:text-2xl'>
                          {proces.title}
                        </summary>
                        <p className='mt-2 text-thrid'>
                          {proces.description}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
                  
                <div className='relative w-full text-center'>
                  <BookingSekarangIcon className={'hidden absolute bottom-12 right-24 md:block laptop:right-[300px]'}/>
                  <Button
                    title={'Lihat Semua Produk'}
                    className={'font-bold text-white rounded-xl px-[35px] py-[17px] bg-primary max-w-[299px] md:mx-auto md:text-xl laptop:text-2xl laptop:py-6 laptop:px-10 laptop:max-w-fit'}
                    to={'/products'}
                  />
                </div>
              </div>
            </section>


          </article>
          { showBookingForm && selectedProduct && (
              <div>
                <Suspense fallback={<div className="loading">Loading...</div>}>
                  <BookingForms
                    product={selectedProduct}
                    onClose={handleCloseForm}
                    isAddToCart={isAddToCart}
                  />
                </Suspense>
              </div>
          )}
        <Footer/>
    </main>
);
}

export default Home