<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'camera_type',
        'brand',
        'description',
        'price_per_day',
        'discount_percentage',
        'discount_amount',
        'discount_type',
        'is_on_sale',
        'discount_start_date',
        'discount_end_date',
        'stock',
        'image_path'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'stock' => 'integer',
        'is_on_sale' => 'boolean',
        'discount_start_date' => 'datetime',
        'discount_end_date' => 'datetime',
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

    /**
     * Check if product has active discount
     */
    public function hasActiveDiscount(): bool
    {
        if (!$this->is_on_sale) {
            return false;
        }

        $now = Carbon::now();
        
        if ($this->discount_start_date && $now->lt($this->discount_start_date)) {
            return false;
        }
        
        if ($this->discount_end_date && $now->gt($this->discount_end_date)) {
            return false;
        }

        return ($this->discount_percentage > 0 || $this->discount_amount > 0);
    }

    /**
     * Get discounted price
     */
    public function getDiscountedPrice(): float
    {
        if (!$this->hasActiveDiscount()) {
            return $this->price_per_day;
        }

        if ($this->discount_type === 'percentage') {
            return $this->price_per_day - ($this->price_per_day * $this->discount_percentage / 100);
        }
        
        return max(0, $this->price_per_day - $this->discount_amount);
    }

    /**
     * Get discount amount in rupiah
     */
    public function getDiscountAmountRupiah(): float
    {
        if (!$this->hasActiveDiscount()) {
            return 0;
        }

        return $this->price_per_day - $this->getDiscountedPrice();
    }

    /**
     * Get discount percentage (calculated for fixed amount discounts)
     */
    public function getDiscountPercentageCalculated(): float
    {
        if (!$this->hasActiveDiscount()) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            return $this->discount_percentage;
        }

        return ($this->getDiscountAmountRupiah() / $this->price_per_day) * 100;
    }

    /**
     * Check if discount is active for a specific date
     */
    public function hasActiveDiscountForDate($date): bool
    {
        if (!$this->is_on_sale) {
            return false;
        }
    
        $checkDate = Carbon::parse($date);
        
        if ($this->discount_start_date && $checkDate->lt(Carbon::parse($this->discount_start_date))) {
            return false;
        }
        
        if ($this->discount_end_date && $checkDate->gt(Carbon::parse($this->discount_end_date))) {
            return false;
        }
    
        return ($this->discount_percentage > 0 || $this->discount_amount > 0);
    }

    /**
     * Calculate rental cost with proper discount logic per day
     */
    public function calculateRentalCost($startDate, $endDate, $quantity = 1): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $totalCost = 0;
        $breakdown = [];
        
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $pricePerDay = $this->hasActiveDiscountForDate($date) 
                ? $this->getDiscountedPrice() 
                : $this->price_per_day;
                
            $dailyCost = $pricePerDay * $quantity;
            $totalCost += $dailyCost;
            
            $breakdown[] = [
                'date' => $date->format('Y-m-d'),
                'price_per_day' => $pricePerDay,
                'has_discount' => $this->hasActiveDiscountForDate($date),
                'daily_cost' => $dailyCost
            ];
        }
        
        return [
            'total_cost' => $totalCost,
            'breakdown' => $breakdown
        ];
    }
}
