<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductsFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'camera_type',
        'brand',
        'description',
        'price_per_day',
        'stock',
        'image_path'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'stock' => 'integer',
    ];

    //relations
    public function equipment()
    {
        return $this->belongsToMany(Equipment::class, 'equipment_product')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItems::class);
    }

    public function qualityChecks()
    {
        return $this->hasMany(QualityControlChecks::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function scopeAvailableForDates($query, $startDate, $endDate)
    {
        return $query->whereDoesntHave('orderItems', function ($query) use ($startDate, $endDate) {
            $query->whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($query) use ($startDate, $endDate) {
                                $query->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    });
            });
        })->where('stock', '>', 0);
    }

    
    /**
     * Memeriksa apakah produk tersedia untuk rentang tanggal tertentu
     */
    public function isAvailableForDates($startDate, $endDate, $excludeOrderId = null)
    {
        $startDate = $startDate instanceof \Carbon\Carbon ? $startDate : \Carbon\Carbon::parse($startDate);
        $endDate = $endDate instanceof \Carbon\Carbon ? $endDate : \Carbon\Carbon::parse($endDate);
        

        $bookedQuantity = $this->getBookedQuantityForDates($startDate, $endDate, $excludeOrderId);
        
        return $this->stock > $bookedQuantity;
    }
    
    /**
     * Mendapatkan jumlah unit yang tersedia untuk rentang tanggal tertentu
     */
    public function getAvailableQuantity($startDate, $endDate, $excludeOrderId = null)
    {
        $startDate = $startDate instanceof \Carbon\Carbon ? $startDate : \Carbon\Carbon::parse($startDate);
        $endDate = $endDate instanceof \Carbon\Carbon ? $endDate : \Carbon\Carbon::parse($endDate);
        
        $bookedQuantity = $this->getBookedQuantityForDates($startDate, $endDate, $excludeOrderId);
        
        return max(0, $this->stock - $bookedQuantity);
    }
    
    /**
     * Mendapatkan jumlah unit yang sudah di-booking pada rentang tanggal tertentu
     */
    private function getBookedQuantityForDates($startDate, $endDate, $excludeOrderId = null)
    {
        return $this->orderItems()
            ->whereHas('order', function ($query) use ($startDate, $endDate, $excludeOrderId) {
                $query->where('status', '!=', 'cancelled')
                    ->when($excludeOrderId, function ($q) use ($excludeOrderId) {
                        $q->where('id', '!=', $excludeOrderId);
                    })
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->where(function ($q) use ($startDate, $endDate) {
                            $q->where('start_date', '<=', $endDate)
                              ->where('end_date', '>=', $startDate);
                        });
                    });
            })
            ->sum('quantity');
    }
    
    /**
     * Mendapatkan daftar tanggal yang tidak tersedia untuk produk ini
     */
    public function getUnavailableDates($startDate = null, $endDate = null, $excludeOrderId = null)
    {
        $startDate = $startDate ?? now();
        $endDate = $endDate ?? now()->addMonths(3);
        
        $startDate = $startDate instanceof \Carbon\Carbon ? $startDate : \Carbon\Carbon::parse($startDate);
        $endDate = $endDate instanceof \Carbon\Carbon ? $endDate : \Carbon\Carbon::parse($endDate);
        
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);
        $unavailableDates = [];
        
        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            if ($this->getAvailableQuantity($dateString, $dateString, $excludeOrderId) <= 0) {
                $unavailableDates[] = $dateString;
            }
        }
        
        return $unavailableDates;
    }
}
