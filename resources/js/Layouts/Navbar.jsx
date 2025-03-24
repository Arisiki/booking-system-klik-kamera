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
    <div>
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
      {user && (
        <NavLink
        href='/profile'>
          Profile
        </NavLink>
      )}
    </div>
  )
}

export default Navbar