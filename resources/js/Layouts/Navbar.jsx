import IconPlaceholder from '@/Components/IconPlaceholder';
import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react'
import { icons } from '@/data';
import { IoIosCloseCircle } from "react-icons/io";

const Navbar = () => {
  const user = usePage().props.auth.user;
  const { url } = usePage();
  const [isNavOpen, setIsNavOpen] = useState(true);
  
  const navData = [
    {
      name: 'Beranda',
      link: '/'
    },
    {
      name: 'Semua Produk',
      link: '/products'
    },
    {
      name: 'Kamera',
      link: '/products/cameras'
    },
    {
      name: 'Aksesoris',
      link: '/products/accecories'
    },
    {
      name: 'Tentang Kami',
      link: '/about'
    },
  ]

  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth >= 800) {
        setIsNavOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [])

  return (
    <nav className='flex justify-between gap-10 section-container mt-4'>
      <button onClick={() => setIsNavOpen(true)}>
        <IconPlaceholder iconImage="icons/Burger.svg" className='md:hidden'/>
      </button>
      <div className={`${isNavOpen ? 'flex flex-col absolute bg-primary text-white py-6 px-10 rounded-lg z-50 pt-14' : 'hidden'} items-center md:flex gap-[18px]  text-primary text-base`}>
        {isNavOpen && (
          <div
            className='bg-dark absolute flex items-center justify-between w-full top-0 left-0 rounded-tl-lg rounded-tr-lg px-3 py-2 font-bold'
          >
            Klik Kamera
            <IoIosCloseCircle
              className='w-6 h-6'
              onClick={() => setIsNavOpen(false)}
            />
          </div>
        )}
        {navData.map(({name, link}) => (
          <Link key={name} href={link} className={`${url === link ? 'font-bold' : 'opacity-50'}`}>
            {name}
          </Link>
        ))}
      </div>

      <div className='flex gap-2 items-center'>
        <IconPlaceholder iconImage={icons.search.path} altImage={icons.search.name}/>
        <IconPlaceholder iconImage={icons.cart.path} altImage={icons.cart.name} link="/cart"/>
        {!user ? (
          <div>
            <Link
              href='/login'
              className='text-sm text-white font-medium bg-primary p-[11px] rounded-md'
            >
              Sign In
            </Link>
          </div>
        ) : (
        <IconPlaceholder iconImage={icons.profile.path} altImage={icons.profile.name} link="/profile" background="bg-primary"/>
        )}
      </div>
    </nav>
  )
}

export default Navbar