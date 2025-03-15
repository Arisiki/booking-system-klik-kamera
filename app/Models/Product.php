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
        return $this->hasMany(Image::class);
    }
}
