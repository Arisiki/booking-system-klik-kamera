import IconPlaceholder from '@/Components/IconPlaceholder';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react'
import { icons } from '@/data';
import { IoIosCloseCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
  const user = usePage().props.auth.user;
  const { url, props } = usePage();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  // Get cart items count from props if available
  const cartItemsCount = props.cartItems ? props.cartItems.length : 0;
  
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
      name: 'Riwayat Order',
      link: '/orders'
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
    <nav className='absolute top-0 right-0 left-0 z-20 pb-3'>
      <div className='flex gap-10 justify-between pt-4 section-container lg:mx-auto'>
        <button name='menu' onClick={() => setIsNavOpen(true)} className='flex justify-center items-center w-10 h-10 rounded-md bg-acccent md:hidden'>
          <img src="/icons/Burger.svg" alt="hamburger-menu" className=''/>
        </button>
        <div className={`${isNavOpen ? 'flex absolute z-50 flex-col px-10 py-6 pt-14 text-white rounded-lg bg-primary' : 'hidden'} items-center md:flex gap-[18px]  text-primary text-base`}>
          {isNavOpen && (
            <div
              className='flex absolute top-0 left-0 justify-between items-center px-3 py-2 w-full font-bold rounded-tl-lg rounded-tr-lg bg-dark'
            >
              Klik Kamera
              <IoIosCloseCircle
                className='w-6 h-6'
                onClick={() => setIsNavOpen(false)}
              />
            </div>
          )}
          {navData.map(({name, link}) => (
            <Link key={name} href={link} className={`${url.endsWith(link) ? 'text-dark font-bold' : ''}`}>
              {name}
            </Link>
          ))}
        </div>

        <div className='flex gap-2 items-center'>
          {/* Search functionality */}
          <div className="relative">
            <button 
              name='search'
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="flex justify-center items-center w-10 h-10 rounded-md bg-acccent"
            >
              <img 
                src={icons.search.path} 
                alt={icons.search.name} 
                className={`${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}
              />
            </button>
            
            <div className={`absolute right-0 top-0 flex items-center transition-all duration-300 ${isSearchOpen ? 'opacity-100 w-[240px] md:w-64 laptop:w-80 lg:w-96' : 'w-0 opacity-0 pointer-events-none'}`}>
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                  className="px-4 py-2 w-full rounded-l-md border border-gray-300 focus:outline-none focus:ring-0 ring-primary"
                />
                <button 
                  name='search'
                  type="submit" 
                  className="px-3 py-2 text-white rounded-r-md bg-primary hover:bg-primary/90"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </form>
              <button 
                name='close-search'
                onClick={() => setIsSearchOpen(false)} 
                className="absolute right-10 p-2 text-red-500 hover:text-red-700"
              >
                <IoIosCloseCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Cart icon with item count badge */}
          <div className="relative">
            <IconPlaceholder iconImage={icons.cart.path} altImage={icons.cart.name} link="/cart"/>
            {cartItemsCount > 0 && (
              <div className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </div>
            )}
          </div>
          
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