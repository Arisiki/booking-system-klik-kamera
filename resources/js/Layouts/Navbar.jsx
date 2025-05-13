import IconPlaceholder from '@/Components/IconPlaceholder';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react'
import { icons } from '@/data';
import { IoIosCloseCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
  const user = usePage().props.auth.user;
  const { url } = usePage();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  console.log(isNavOpen);
  
  
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

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get('/products', { search: searchQuery });
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth >= 800) {
  //       setIsNavOpen(false);
  //     }
  //   }
  
  //   window.addEventListener('resize', handleResize);
  
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);



  return (
    <>
    <nav className='pb-3 absolute top-0 left-0 right-0 z-20'>
      <div className='flex justify-between gap-10 pt-4 section-container lg:mx-auto'>
        <button onClick={() => setIsNavOpen(true)} className='w-10 h-10 flex items-center justify-center rounded-md bg-acccent md:hidden'>
          <img src="/icons/Burger.svg" alt="hamburger-menu" className=''/>
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
            <Link key={name} href={link} className={`${url.endsWith(link) ? 'font-bold' : 'opacity-50'}`}>
              {name}
            </Link>
          ))}
        </div>

        <div className='flex gap-2 items-center'>
          {/* Search functionality */}
          <div className="relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="w-10 h-10 flex items-center justify-center rounded-md bg-acccent"
            >
              <img 
                src={icons.search.path} 
                alt={icons.search.name} 
                className={`${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}
              />
            </button>
            
            <div className={`absolute right-0 top-0 flex items-center transition-all duration-300 ${isSearchOpen ? 'w-[240px] md:w-64 laptop:w-80 lg:w-96 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                  className="w-full px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-0 ring-primary"
                />
                <button 
                  type="submit" 
                  className="px-3 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </form>
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="absolute right-10 p-2 text-red-500 hover:text-red-700"
              >
                <IoIosCloseCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          
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
      </div>
    </nav>
    <hr className='xl:hidden absolute left-0 right-0 top-[70px]'/>
    <div className='my-8 bg-red-200 opacity-0 z-100'>nav</div>
    </>
  )
}

export default Navbar