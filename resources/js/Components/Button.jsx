import { router } from '@inertiajs/react'
import React from 'react'

const Button = ({title, className, to}) => {
  return (
    <button className={className} onClick={() => router.visit(to)}>
        {title}
    </button>
  )
}

export default Button