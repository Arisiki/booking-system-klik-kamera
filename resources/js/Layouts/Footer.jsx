import React from 'react'
import { company, help, socialMediaIcons } from '@/data'
import IconPlaceholder from '@/Components/IconPlaceholder'
import { Link } from '@inertiajs/react'


const Footer = () => {

  return (
    <footer className='py-4 mt-8 w-full text-white bg-dark md:py-8'>
      <div className='section-container lg:mx-auto'>
        <div className='flex flex-col gap-14 w-full md:flex-row'>
          <div className='flex flex-col gap-2 md:w-1/2 md:gap-4 lg:w-1/3'>
            <h1 className='font-bold text-[32px] md:text-4xl'>Klik Kamera</h1>
            <p className='text-base text-[#B9B3B3] md:text-lg'>
              Tempat sewa kamera dan alat terlengkap di Bali. Bisa Home Delivery bisa Pickup ke toko Denpasar/Bangli.
            </p>
            <div className='flex gap-4'>
              {socialMediaIcons.map((icon) => (
                <IconPlaceholder
                  key={icon.name}
                  iconImage={icon.path}
                  altImage={icon.name}
                  background='bg-thrid'
                  className='hover:bg-primary'
                />
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-8 md:w-1/2 lg:flex-row lg:w-2/3 lg:gap-16'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-lg font-semibold md:text-xl'>Company</h2>
              <div className='flex flex-col text-sm text-[#B9B3B3] gap-5 md:text-base'>
                {company.map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    className='hover:text-primary hover:underline'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <h2 className='text-lg font-semibold md:text-xl'>Help</h2>
              <div className='flex flex-col text-sm text-[#B9B3B3] gap-5 md:text-base'>
                {help.map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    className='hover:text-primary hover:underline'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className='flex flex-col gap-2 lg:flex-1 lg:gap-4'>
              <h2 className='text-lg font-semibold md:text-xl'>Subscribe to Newsletter</h2>
              <div className='overflow-hidden w-full rounded-md'>
                <input
                  type="email"
                  className='text-primary border-none w-[80%] py-3'
                  placeholder='Tulis email kamu'
                  // onSubmit={'/'}
                />
                <button className='bg-[#2D5D7C] py-3 px-4 w-[20%]'>
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4 mt-8'>
          <hr className='opacity-50' />
          <h3 className='text-xs text-center text-[#B9B3B3] md:text-base'>
            © Copyright 2024, All Rights Reserved by Klik Kamera
          </h3>
        </div>

      </div>
    </footer>
  )
}

export default Footer