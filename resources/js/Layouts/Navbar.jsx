import NavLink from '@/Components/NavLink'
import { usePage } from '@inertiajs/react';
import React from 'react'

const Navbar = () => {
  const user = usePage().props.auth.user;
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

  return (
    <nav className='flex justify-around'>
      {navData.map((nav) => (
        <NavLink
          key={nav.name}
          href={nav.link}
        >
          {nav.name}
        </NavLink>
      ))}

      <NavLink
        href='/cart'
      >
        Cart
      </NavLink>


      {!user ? (
        <div>
          <NavLink
            href='/login'
          >
            Login
          </NavLink>
          <NavLink
            href='/register'
          >
            Register
          </NavLink>
        </div>
      ) : (
        <NavLink
          href='/profile'
        >
          Profile
        </NavLink>
      )}
    </nav>
  )
}

export default Navbar