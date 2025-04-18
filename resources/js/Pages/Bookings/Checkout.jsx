import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';

export default function Checkout() {
    const { order, snapToken } = usePage().props;
    const [isSnapReady, setIsSnapReady] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSnap = setInterval(() => {
            if (window.snap) {
                setIsSnapReady(true);
                setIsLoading(false);
                clearInterval(checkSnap);
            }
        }, 100);

        return () => {
            clearInterval(checkSnap);
            if (window.snap) {
                window.snap.hide();
            }
        };
    }, []);

    const handlePayment = () => {
        if (isSnapReady && window.snap && !isPopupOpen) {
            setIsPopupOpen(true);
            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result) {
                    alert('Payment Success');
                    setIsPopupOpen(false);
                    router.visit('/orders', { preserveState: false });
                },
                onError: function (result) {
                    alert('Payment failed');
                    console.log(result);
                    setIsPopupOpen(false);
                },
                onPending: function (result) {
                    alert('Waiting for your Payment...');
                    setIsPopupOpen(false);
                    router.visit('/orders', { preserveState: false });
                },
                onClose: function () {
                    setIsPopupOpen(false);
                },
            });
        } else if (!isSnapReady) {
            console.error('Snap is not ready');
            alert('Payment system is still loading. Please try again in a moment.');
        }
    };

    useEffect(() => {
        if (isSnapReady && snapToken && window.snap && !isPopupOpen) {
            setTimeout(() => {
                handlePayment();
            }, 500);
        }
    }, [isSnapReady, snapToken, isPopupOpen]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Navbar />
            
            <main className="flex-1 section-container py-6 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl md:text-2xl font-bold text-primary">
                                Pembayaran
                            </h1>
                            <p className="text-sm md:text-base text-third">
                                Order ID: #{order?.id}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="bg-white p-8 rounded-xl border border-third/10 text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-primary font-medium">Mempersiapkan halaman pembayaran...</p>
                                <p className="text-third text-sm mt-2">Mohon tunggu sebentar</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-third/10 overflow-hidden">
                                <div className="border-b border-third/10 p-4">
                                    <p className="text-primary font-medium">Detail Pembayaran</p>
                                </div>
                                <div 
                                    id="snap-container" 
                                    className="w-full md:w-[768px] h-[600px] md:h-[720px] mx-auto"
                                >
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}