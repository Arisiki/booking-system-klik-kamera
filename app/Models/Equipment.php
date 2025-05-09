<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'equipment_product')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
