import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Navbar from "@/Layouts/Navbar";
import BookingForms from "./BookingForms";
import ReviewForm from "@/Components/ReviewForm";
import Countdown from "react-countdown";
import Footer from "@/Layouts/Footer";
import { formatRupiah } from "@/utils";

export default function Orders() {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [review, setReview] = useState(false);

    const { orders } = usePage().props;
    console.log(orders);

    // useEffect(() => {
    //     router.reload({ only: ["orders"] });
    // }, []);

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

    return (
        <main className="relative mb-0">
            <Navbar />
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
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        order.status === "completed" 
                                            ? "bg-green-100 text-green-700" 
                                            : order.status === "pending" 
                                            ? "bg-yellow-100 text-yellow-700"
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
                                                <span className="text-thrid/70 text-sm">(Qty: {item.quantity})</span>
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
                
                {showBookingForm && selectedProduct && selectedOrder && (
                    <BookingForms
                        product={selectedProduct}
                        onClose={handleCloseForm}
                        isAddToCart={false}
                        phoneNumber={selectedOrder.order.phone_number}
                        quantity={selectedOrder.item.quantity}
                        extendAddress={selectedOrder.order.address}
                        isExtend={true}
                    />
                )}
            </section>
            <Footer />
        </main>
    );
}