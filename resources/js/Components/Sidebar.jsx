import React from 'react'
import { IoIosCloseCircle } from 'react-icons/io'

const Sidebar = ({filters, categories, cameraTypes, brands, handleFilterChange, className, setFilterOpen}) => {
  return (
    <aside className={`w-[269px] h-fit border p-10 rounded-2xl ${className}`}>
      <div className='w-full h-fit flex flex-col md:flex-row md:gap-16 gap-4 laptop:flex-col'>
        <button
            className='text-red-600 absolute right-5 top-5 laptop:hidden'
            onClick={() => setFilterOpen(false)}
        >
            <IoIosCloseCircle
              className='w-9 h-9'
            />
        </button>
            <div className='flex flex-col'>
                <h3 className='text-primary font-bold text-xl'>Kategori</h3>
                <hr className='my-2'/>
                <label className='text-lg text-primary flex items-center gap-2'>
                    <input
                        type="radio"
                        name="category"
                        value=""
                        checked={!filters.category}
                        onChange={() => handleFilterChange('category', '')}
                        className='text-primary'
                    />
                    Semua
                </label>
                {categories.map(category => (
                    <label key={category} className='text-lg text-primary flex items-center gap-2'>
                        <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={filters.category === category}
                            onChange={() => handleFilterChange('category', category)}
                            className='text-primary'
                        />
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </label>
                ))}
            </div>


            <div className={`${filters.category === 'camera' ? 'opacity-100' : 'opacity-50 pointer-events-none'} flex flex-col`}>
                <h3 className='text-primary font-bold text-xl'>Jenis Kamera</h3>
                <hr className='my-2'/>
                <label className='text-lg text-primary flex items-center gap-2'>
                    <input
                        type="radio"
                        name="camera_type"
                        value=""
                        checked={!filters.camera_type}
                        onChange={() => handleFilterChange('camera_type', '')}
                        className='text-primary'
                    />
                    Semua
                </label>
                {cameraTypes.map(type => (
                    <label key={type} className='text-lg text-primary flex items-center gap-2'>
                        <input
                            type="radio"
                            name="camera_type"
                            value={type}
                            checked={filters.camera_type === type}
                            onChange={() => handleFilterChange('camera_type', type)}
                            className='text-primary'
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </label>
                ))}
            </div>

            <div className='flex flex-col'>
                <h3 className='text-primary font-bold text-xl'>Merek</h3>
                <hr className='my-2'/>
                <label className='text-lg text-primary flex items-center gap-2'>
                    <input
                        type="radio"
                        name="brand"
                        value=""
                        checked={!filters.brand}
                        onChange={() => handleFilterChange('brand', '')}
                        className='text-primary'
                    />
                    Semua
                </label>
                {brands.map(brand => (
                    <label key={brand} className='text-lg text-primary flex items-center gap-2'>
                        <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={filters.brand === brand}
                            onChange={() => handleFilterChange('brand', brand)}
                            className='text-primary'
                        />
                        {brand.charAt(0).toUpperCase() + brand.slice(1)}
                    </label>
                ))}
            </div>
        </div>
    </aside>
  )
}

export default Sidebar