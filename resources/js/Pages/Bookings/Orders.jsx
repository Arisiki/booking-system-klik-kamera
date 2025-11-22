import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Navbar from "@/Layouts/Navbar";
import BookingForms from "./BookingForms";
import ReviewForm from "@/Components/ReviewForm";
import Countdown from "react-countdown";
import Footer from "@/Layouts/Footer";
import { formatRupiah, useScrollTop } from "@/utils";

export default function Orders() {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [review, setReview] = useState(false);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusOrder, setStatusOrder] = useState(null);

    const { orders } = usePage().props;
    console.log(orders);

    // useEffect(() => {
    //     router.reload({ only: ["orders"] });
    // }, []);

    const handleCheckStatus = (order) => {
        setStatusOrder(order);
        setShowStatusModal(true);
    };

    const handleCancelOrder = (orderId) => {
        if (confirm("Are you sure you want to cancel this order?")) {
            router.post(
                `/orders/${orderId}/cancel`,
                {},
                {
                    onSuccess: () => {
                        alert("Order cancelled successfully!");
                        router.reload({ only: ["orders"] });
                    },
                    onError: (errors) => {
                        alert(
                            "Failed to cancel order: " +
                            (errors.error || "Unknown error")
                        );
                    },
                }
            );
        }
    };

    const handleExtendOrder = (product, order, item) => {
        setSelectedProduct(product);
        setSelectedOrder({ order, item });
        setShowBookingForm(true);
    };

    const handleCloseForm = () => {
        setShowBookingForm(false);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return (
                <span className="text-red-500 text-sm">Order has expired</span>
            );
        }
        return (
            <span className="text-yellow-500 text-sm">
                Expires in: {hours}h {minutes}m {seconds}s
            </span>
        );
    };

    useScrollTop([showBookingForm]);

    return (
        <>
            <Navbar />
            <main className="relative mb-0">
                <section className="section-container mt-6 mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">My Orders</h1>

                    {orders.length > 0 ? (
                        <div className="flex flex-col gap-6 laptop:grid laptop:grid-cols-2">
                            {orders.map((order) => (
                                <div key={order.id} className="p-4 md:p-6 border border-thrid/10 rounded-3xl bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <span className="text-xs text-thrid/70">Order ID:</span>
                                            <h3 className="text-primary font-medium">{order.id}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${order.status === "completed"
                                            ? "bg-green-100 text-green-700"
                                            : order.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : order.status === "waiting_confirmation"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : order.status === "booked"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : order.status === "payment_complete"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                                        </span>
                                    </div>

                                    {order.status === "pending" && order.expires_at && (
                                        <div className="mb-3">
                                            <Countdown
                                                date={new Date(order.expires_at)}
                                                renderer={renderer}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-acccent p-3 rounded-md">
                                            <h4 className="text-sm font-medium text-primary mb-2">Products</h4>
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="mb-1">
                                                    <span className="font-medium">{item.product.name}</span>
                                                    <span className="text-thrid/70 text-sm"> (Jumlah item: {item.quantity})</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-acccent p-3 rounded-md">
                                            <h4 className="text-sm font-medium text-primary mb-2">Rental Period</h4>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    <span className="text-xs text-thrid/70">Start:</span>
                                                    <p className="text-thrid">
                                                        {new Date(order.start_date).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                        {order.pickup_time && (
                                                            <span className="text-secondary ml-2">• {order.pickup_time}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-thrid/70">End:</span>
                                                    <p className="text-thrid">
                                                        {new Date(order.end_date).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                        {order.return_time && (
                                                            <span className="text-secondary ml-2">• {order.return_time}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4 p-3 bg-acccent/50 rounded-md">
                                        <div>
                                            <span className="text-xs text-thrid/70">Total Cost:</span>
                                            <p className="text-secondary font-bold text-lg">{formatRupiah(order.total_cost)}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {order.status === "pending" && (
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => router.visit(`/checkout/${order.id}`)}
                                                        className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-dark transition-colors"
                                                    >
                                                        Bayar
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {order.status === "waiting_confirmation" && (
                                                <button
                                                    onClick={() => handleCheckStatus(order)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                                                >
                                                    Check Payment Status
                                                </button>
                                            )}
                                            {order.status === "payment_complete" && (
                                                <button
                                                    onClick={() => router.visit(`/orders/${order.id}/qc`)}
                                                    className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 transition-colors"
                                                >
                                                    Isi QC
                                                </button>
                                            )}
                                            {order.status === "booked" && order.order_items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleExtendOrder(item.product, order, item)}
                                                    className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    Extend
                                                </button>
                                            ))}
                                            {order.status === "completed" && !order.review && order.order_items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setReview(true)}
                                                    className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary/90 transition-colors"
                                                >
                                                    Tambahkan Review
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {order.status === "completed" && !order.review && review && (
                                        <div className="mt-4 p-4 border rounded-lg bg-acccent">
                                            <ReviewForm
                                                order={order}
                                                setReview={setReview}
                                            />
                                        </div>
                                    )}

                                    {order.review && (
                                        <div className="mt-4 p-4 border rounded-lg bg-acccent">
                                            <h3 className="text-lg font-bold text-primary mb-2">
                                                Your Review
                                            </h3>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-yellow-500 text-lg">
                                                    {"★".repeat(order.review.rating)}
                                                    {"☆".repeat(5 - order.review.rating)}
                                                </p>
                                                <p className="text-thrid">
                                                    <span className="font-medium">Comment:</span>{" "}
                                                    {order.review.comment || "No comment"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-acccent rounded-lg">
                            <p className="text-thrid/70 text-lg">You have no orders yet.</p>
                        </div>
                    )}
                </section>
            </main>
            {showBookingForm && selectedProduct && selectedOrder && (
                <div className="bg-black">
                    <div className='fixed bg-primary/50 backdrop-blur-sm left-0 z-40 top-0 right-0 bottom-0' />
                    <BookingForms
                        product={selectedProduct}
                        onClose={handleCloseForm}
                        isAddToCart={false}
                        phoneNumber={selectedOrder.order.phone_number}
                        quantity={selectedOrder.item.quantity}
                        extendAddress={selectedOrder.order.address}
                        isExtend={true}
                    />
                </div>
            )}

            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-primary">Status Pembayaran</h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-800 mb-1">Menunggu Konfirmasi Admin</p>
                                    <p className="text-sm text-blue-700">
                                        Pembayaran anda sedang dalam proses pengecekan oleh Admin.
                                        Mohon tunggu maksimal 1x24 jam.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-medium text-gray-900">#{statusOrder?.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Pembayaran</span>
                                <span className="font-medium text-gray-900">{statusOrder && formatRupiah(statusOrder.total_cost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status Saat Ini</span>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
                                    Waiting Confirmation
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}