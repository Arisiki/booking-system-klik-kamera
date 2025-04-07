import { icons } from '@/data'
import React from 'react'

const CardProduct = ({productName, productPrice, productImage, bookNow, addToCart}) => {

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(productPrice)
  return (
    <div
      className='w-[170px] border rounded-[18px] px-2 pt-10 pb-5 flex flex-col items-center gap-2 laptop:w-[16dvw] lg:w-[250px] h-fit laptop:px-3 lg:px-5 relative'
    >
      <div className='absolute flex top-0 left-4 w-fit h-fit p-[10px] bg-secondary rounded-b-lg gap-1'>
        <img src={icons.bestPick.path} alt={icons.bestPick.name} />
        <div className='h-[1] w-[1px] bg-white hidden laptop:block'/>
        <h2 className='text-white text-xs hidden laptop:block'>Pilihan Terbaik</h2>
      </div>

      <img src="icons/Kamera.png" alt="" className='lg:w-[149px] lg:h-[133px]'/>
      <div className='flex flex-col mt-2 gap-4 min-w-full'>
        <div className='flex flex-col gap-2'>
          <h2 className='font-bold text-primary text-lg leading-none lg:text-xl'>{productName}</h2>
          <h3 className='font-bold text-secondary text-sm leading-none lg:text-base'>Rp.{formattedPrice.split('.')[0]}K /Day</h3>
          <hr />
        </div>
        <div className='flex justify-between gap-2'>
          <button className='bg-primary text-white flex justify-center items-center px-6 py-1 gap-2 rounded-full lg:text-lg font-bold lg:py-2 flex-1' onClick={bookNow}>
            Book
            <img src={icons.arrowUp.path} alt={icons.arrowUp.name} className='w-4 h-4'/>
          </button>
          <button className='w-8 h-8 rounded-full border border-primary flex justify-center items-center lg:w-11 lg:h-11' onClick={addToCart}>
            <img src={icons.addCart.path} alt={icons.addCart.name} className='w-5 h-5 lg:h-7 lg:w-7' />
          </button>
        </div>
      </div>
      
    </div>
  )
}

export default CardProduct