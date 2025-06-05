<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->dateTime('order_date');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('pickup_method', ['pickup', 'home_delivery']);
            $table->decimal('total_cost', 10, 2);
            $table->enum('status', [
                'pending',
                'payment_complete',
                'booked',
                'being_returned',
                'completed',
                'cancelled',
            ])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void

    {
        // Kembalikan kolom status ke string biasa
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
        Schema::dropIfExists('orders');
    }
};
