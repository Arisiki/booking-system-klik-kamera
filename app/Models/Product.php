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

    public function isAvailableForDates($startDate, $endDate)
    {
        $conflictingOrders = $this->orderItems()
            ->whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($query) use ($startDate, $endDate) {
                                $query->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    });
            })->count();

        // Jika tidak ada orderItems, anggap tersedia
        return $conflictingOrders === 0 && $this->stock > 0;
    }
}
