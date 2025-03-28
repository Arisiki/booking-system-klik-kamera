<?php

namespace App\Jobs;

use App\Models\Order;
use App\Mail\OrderCancelledNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CancelOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle()
    {
        $order = Order::find($this->orderId);

        if (!$order) {
            Log::warning('Order not found for cancellation', ['order_id' => $this->orderId]);
            return;
        }

        // Hanya batalkan jika status masih pending atau pending_payment
        if (!in_array($order->status, ['pending', 'pending_payment'])) {
            Log::info('Order cannot be cancelled as it is no longer pending', [
                'order_id' => $this->orderId,
                'status' => $order->status,
            ]);
            return;
        }

        try {
            // Kirim email notifikasi ke user
            Mail::to($order->email)->send(new OrderCancelledNotification($order));

            // Hapus order items terkait
            $order->orderItems()->delete();

            // Ubah status order menjadi cancelled
            $order->update(['status' => 'cancelled']);

            Log::info('Order automatically cancelled due to expiration', [
                'order_id' => $this->orderId,
                'order_date' => $order->order_date->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cancel expired order', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
