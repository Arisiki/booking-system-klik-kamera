import { Link } from '@inertiajs/react'
import React from 'react'

const IconPlaceholder = ({iconImage, link, background, className, altImage}) => {
  
  return (
    <Link
    href={link}
      className={`w-10 h-10 ${background ?? 'bg-acccent'} flex items-center justify-center rounded-md ${className}`}
    >
      <img src={iconImage} alt={altImage} />
    </Link>
  )
}

export default IconPlaceholder