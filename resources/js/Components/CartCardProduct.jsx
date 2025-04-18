import React from 'react'
import { AiOutlineArrowsAlt } from 'react-icons/ai';

const CartCardProduct = ({image, productName, productQuantity, startDate, endDate, dayPrice, totalPrice}) => {
  return (
    <div className='flex w-full flex-row gap-4 p-3 rounded-xl border border-thrid/10'>
        <div className='bg-[#F1F5F9] px-2 rounded-xl flex items-center justify-center'>
            <img src="/icons/Kamera.svg" alt="" className='w-24 md:w-48' />
        </div>

        <div className='w-full flex flex-col gap-6'>
            <div className='flex justify-between'>
                <div>
                    <h2 className='font-bold text-dark'>Sony A6000</h2>
                    <div className='flex items-center gap-1'>
                        <AiOutlineArrowsAlt className='text-xs text-primary/70' />
                        <span className='text-xs text-primary/70'>1 Unit</span>
                    </div>
                </div>
                <div className='flex flex-col gap-0'>
                    <h2 className='font-bold text-secondary'>Rp.330.000</h2>
                    <span className='text-xs text-thrid/50'>Rp.95.000/Day</span>
                </div>
            </div>

            <div className='flex gap-2'>
                <span className='px-3 bg-acccent rounded-full text-primary text-xs md:text-base md:px-5 md:py-1'>4 April 2023</span>
                {/* <span className='px-2 bg-acccent rounded-full text-primary text-xs md:text-base md:px-3 flex items-center'>-</span> */}
                <span className='px-3 bg-acccent rounded-full text-primary text-xs md:text-base md:px-5 md:py-1'>4 April 2023</span>
            </div>
        </div>
    </div>
  )
}

export default CartCardProduct