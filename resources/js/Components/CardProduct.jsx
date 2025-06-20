import { icons } from '@/data'
import { formatRupiah } from '@/utils'
import { Link } from '@inertiajs/react'
import React from 'react'

const CardProduct = ({productName, productPrice, productId, productImage, bookNow, addToCart, product}) => {

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(productPrice)

  // Fungsi untuk mengecek apakah produk sedang diskon
  const hasActiveDiscount = () => {
    if (!product?.discount_percentage || !product?.discount_start_date || !product?.discount_end_date) {
      return false;
    }
    
    const now = new Date();
    const startDate = new Date(product.discount_start_date);
    const endDate = new Date(product.discount_end_date);
    
    // Set waktu ke akhir hari untuk endDate (23:59:59)
    endDate.setHours(23, 59, 59, 999);
    
    return now >= startDate && now <= endDate;
  };

  // Fungsi untuk menghitung harga setelah diskon
  const getDiscountedPrice = () => {
    if (!hasActiveDiscount()) return productPrice;
    return productPrice - (productPrice * product.discount_percentage / 100);
  };

  return (
    <div
      className='md:w-[20dvw] bg-white border rounded-[18px] px-2 pt-10 pb-5 flex flex-col items-center gap-2 laptop:w-[16dvw] lg:w-[250px] h-fit laptop:px-3 lg:px-5 relative'
    >
      <Link href={`/products/${productId}`}>
      <div className='absolute flex top-0 left-4 w-fit h-fit p-[10px] bg-secondary rounded-b-lg gap-1'>
        <img src={icons.bestPick.path} alt={icons.bestPick.name} />
        <div className='h-[1] w-[1px] bg-white hidden laptop:block'/>
        <h2 className='hidden text-xs text-white laptop:block'>Pilihan Terbaik</h2>
      </div>

      {/* Discount Badge */}
      {hasActiveDiscount() && (
        <div className='absolute top-0 right-4 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-b-lg'>
          -{product.discount_percentage}%
        </div>
      )}

      <img src={`/storage/${productImage.find(img => img.is_primary).image_path}`} alt="" className='lg:h-[133px]' loading='lazy'/>
      </Link>

      <div className='flex flex-col gap-4 mt-2 min-w-full'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-bold leading-none text-primary lg:text-xl'>{productName}</h2>
          
          {/* Price Display with Discount */}
          <div className='flex flex-col gap-1'>
            {hasActiveDiscount() ? (
              <>
                <div className='flex gap-2 items-center'>
                  <h3 className='text-sm font-bold leading-none text-secondary lg:text-base'>
                    {formatRupiah(getDiscountedPrice())} /Hari
                  </h3>
                </div>
                <div className='text-xs text-gray-500 line-through'>
                  {formatRupiah(productPrice)} /Hari
                </div>
              </>
            ) : (
              <h3 className='text-sm font-bold leading-none text-secondary lg:text-base'>
                {formatRupiah(productPrice)} /Hari
              </h3>
            )}
          </div>
          
          <hr />
        </div>

        <div className='flex gap-2 justify-between'>
          <button className='flex flex-1 gap-2 justify-center items-center px-6 py-1 font-bold text-white rounded-full bg-primary lg:text-lg lg:py-2' onClick={bookNow}>
            Book
            <img src={icons.arrowUp.path} alt={icons.arrowUp.name} className='w-4 h-4'/>
          </button>
          <button className='flex justify-center items-center w-8 h-8 rounded-full border border-primary lg:w-11 lg:h-11' onClick={addToCart}>
            <img src={icons.addCart.path} alt={icons.addCart.name} className='w-5 h-5 lg:h-7 lg:w-7' />
          </button>
        </div>
      </div>
      
    </div>
  )
}

export default CardProduct