<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrdersFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'email',
        'phone_number',
        'order_date',
        'start_date',
        'end_date',
        'pickup_method',
        'total_cost',
        'status',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'pickup_method' => 'string',
        'total_cost' => 'decimal:2',
        'status' => 'string',
    ];

    //relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItems::class);
    }

    public function qualityChecks()
    {
        return $this->hasMany(QualityControlChecks::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
