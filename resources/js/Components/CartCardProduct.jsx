import { formatDateShort, formatRupiah } from '@/utils';
import React from 'react'
import { AiOutlineArrowsAlt } from 'react-icons/ai';


const CartCardProduct = ({image, productName, productQuantity, startDate, endDate, dayPrice, originalPrice, hasDiscount, discountPercentage, totalPrice}) => {
  return (
    <div className='flex flex-row gap-4 p-3 w-full rounded-xl border border-thrid/10'>
        <div className='bg-[#F1F5F9] px-2 rounded-xl flex items-center justify-center'>
            <img src="/icons/Kamera.svg" alt="" className='w-24 md:w-48' />
        </div>

        <div className='flex flex-col gap-6 w-full'>
            <div className='flex justify-between'>
                <div>
                    <h2 className='font-bold text-dark'>{productName}</h2>
                    <div className='flex gap-1 items-center'>
                        <AiOutlineArrowsAlt className='text-xs text-primary/70' />
                        <span className='text-xs text-primary/70'>{productQuantity} Unit</span>
                    </div>
                    {hasDiscount && (
                        <div className='flex gap-1 items-center mt-1'>
                            <span className='px-2 py-1 text-xs text-red-600 bg-red-100 rounded-full'>
                                -{discountPercentage}% OFF
                            </span>
                        </div>
                    )}
                </div>
                <div className='flex flex-col gap-0'>
                    <h2 className='font-bold text-secondary'>{formatRupiah(totalPrice)}</h2>
                    <div className='flex flex-col items-end'>
                        {hasDiscount ? (
                            <>
                                <span className='text-xs line-through text-thrid/50'>{formatRupiah(originalPrice)}</span>
                                <span className='text-xs font-medium text-green-600'>{formatRupiah(dayPrice)}</span>
                            </>
                        ) : (
                            <span className='text-xs text-thrid/50'>{formatRupiah(dayPrice)}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex gap-2'>
                <span className='px-3 text-xs rounded-full bg-acccent text-primary md:text-base md:px-5 md:py-1'>{formatDateShort(startDate)}</span>
                <span className='px-3 text-xs rounded-full bg-acccent text-primary md:text-base md:px-5 md:py-1'>{formatDateShort(endDate)}</span>
            </div>
        </div>
    </div>
  )
}

export default CartCardProduct