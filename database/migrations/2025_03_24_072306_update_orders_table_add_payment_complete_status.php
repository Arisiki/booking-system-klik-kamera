<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateOrdersTableAddPaymentCompleteStatus extends Migration
{
    public function up()
    {
        // Ubah kolom status menjadi enum dengan nilai yang diizinkan
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', [
                'pending',
                'payment_complete', // Status baru
                'booked',
                'being_returned',
                'completed',
                'cancelled',
            ])->default('pending')->change();
        });

        // Ubah status 'booked' yang sudah ada menjadi 'payment_complete'
        DB::table('orders')
            ->where('status', 'booked')
            ->update(['status' => 'payment_complete']);
    }

    public function down()
    {
        // Kembalikan kolom status ke string biasa
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });

        // Kembalikan status 'payment_complete' ke 'booked'
        DB::table('orders')
            ->where('status', 'payment_complete')
            ->update(['status' => 'booked']);
    }
}
