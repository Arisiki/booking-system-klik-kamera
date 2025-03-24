<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateQualityControlChecksTableStructure extends Migration
{
    public function up()
    {
        Schema::table('quality_control_checks', function (Blueprint $table) {
            // Hapus kolom lama yang tidak diperlukan
            $table->dropColumn(['type', 'condition', 'is_damaged', 'checked_at']);

            // Tambah kolom baru
            $table->string('category')->after('product_id');
            $table->foreignId('checked_by')->constrained('users')->onDelete('cascade')->after('category');
            $table->dateTime('check_date')->after('checked_by');
            $table->json('results')->after('check_date');
            $table->enum('status', ['Layak Digunakan', 'Perlu Perbaikan', 'Tidak Layak'])->after('results');
            $table->text('notes')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('quality_control_checks', function (Blueprint $table) {
            // Kembalikan kolom lama
            $table->string('type')->nullable();
            $table->string('condition')->nullable();
            $table->boolean('is_damaged')->default(false);
            $table->dateTime('checked_at')->nullable();

            // Hapus kolom baru
            $table->dropColumn(['category', 'checked_by', 'check_date', 'results', 'status', 'notes']);
        });
    }
}
