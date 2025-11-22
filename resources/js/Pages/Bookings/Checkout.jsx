import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';
import axios from 'axios';

export default function Checkout() {
    const { order } = usePage().props;
    const [paymentMethod, setPaymentMethod] = useState('midtrans'); // 'midtrans' or 'manual'
    const [snapToken, setSnapToken] = useState(null);
    const [isSnapLoading, setIsSnapLoading] = useState(false);

    // Format currency
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const handleMidtransPayment = async () => {
        if (snapToken) {
            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    alert("Payment Success!");
                    router.visit('/orders');
                },
                onPending: function (result) {
                    alert("Waiting for your payment!");
                    router.visit('/orders');
                },
                onError: function (result) {
                    alert("Payment failed!");
                    console.log(result);
                },
                onClose: function () {
                    console.log('customer closed the popup without finishing the payment');
                }
            });
            return;
        }

        setIsSnapLoading(true);
        try {
            const response = await axios.get(route('orders.midtrans-token', order.id));
            const token = response.data.token;
            setSnapToken(token);

            window.snap.pay(token, {
                onSuccess: function (result) {
                    alert("Payment Success!");
                    router.visit('/orders');
                },
                onPending: function (result) {
                    alert("Waiting for your payment!");
                    router.visit('/orders');
                },
                onError: function (result) {
                    alert("Payment failed!");
                    console.log(result);
                },
                onClose: function () {
                    console.log('customer closed the popup without finishing the payment');
                }
            });
        } catch (error) {
            console.error("Error fetching snap token:", error);
            alert("Gagal memuat sistem pembayaran. Silakan coba lagi.");
        } finally {
            setIsSnapLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
                <main className="flex-1 section-container py-6 md:py-10">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold text-primary mb-6">Detail Order & Pembayaran</h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Order Summary */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Rincian Pesanan</h2>
                                    <div className="space-y-4">
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold">{formatRupiah(item.rental_cost)}</p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">{formatRupiah(order.total_cost)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Metode Pembayaran</h2>
                                    <div className="space-y-3">
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'midtrans' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="midtrans"
                                                checked={paymentMethod === 'midtrans'}
                                                onChange={() => setPaymentMethod('midtrans')}
                                                className="w-4 h-4 text-primary focus:ring-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="block font-medium text-gray-800">Midtrans Payment Gateway</span>
                                                <span className="block text-sm text-gray-500">Virtual Account, E-Wallet, Credit Card</span>
                                            </div>
                                        </label>

                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="manual"
                                                checked={paymentMethod === 'manual'}
                                                onChange={() => setPaymentMethod('manual')}
                                                className="w-4 h-4 text-primary focus:ring-primary"
                                            />
                                            <div className="ml-3">
                                                <span className="block font-medium text-gray-800">Transfer Bank Manual</span>
                                                <span className="block text-sm text-gray-500">Transfer langsung ke rekening admin</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Sidebar */}
                            <div className="md:col-span-1">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                                    <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Pembayaran</h3>
                                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatRupiah(order.total_cost)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 border-t">
                                            <span>Total Tagihan</span>
                                            <span>{formatRupiah(order.total_cost)}</span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'midtrans' ? (
                                        <button
                                            onClick={handleMidtransPayment}
                                            disabled={isSnapLoading}
                                            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSnapLoading ? 'Memuat...' : 'Bayar Sekarang'}
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                                <p className="font-semibold mb-1">Rekening Tujuan:</p>
                                                <p>BCA: 1234567890</p>
                                                <p>A.N: PT Klik Kamera</p>
                                                <p className="mt-2">Silakan transfer sesuai nominal dan konfirmasi ke Admin.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Apakah anda yakin sudah melakukan transfer? Status order akan diubah menjadi Menunggu Konfirmasi.')) {
                                                        // Open WA immediately to prevent popup blocker
                                                        const waUrl = `https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20konfirmasi%20pembayaran%20untuk%20Order%20ID:%20${order.id}`;
                                                        window.open(waUrl, '_blank');

                                                        // Update status
                                                        setIsSnapLoading(true);
                                                        router.post(route('orders.confirm-manual', order.id), {}, {
                                                            onSuccess: () => {
                                                                // Redirect is handled by backend, but we ensure loading stops
                                                                setIsSnapLoading(false);
                                                            },
                                                            onError: (errors) => {
                                                                console.error(errors);
                                                                setIsSnapLoading(false);
                                                                alert('Gagal mengupdate status. Silakan cek riwayat order anda.');
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={isSnapLoading}
                                                className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSnapLoading ? 'Memproses...' : 'Konfirmasi & Chat Admin'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}