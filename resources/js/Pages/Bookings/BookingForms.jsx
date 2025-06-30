import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, parse, addDays, eachDayOfInterval } from "date-fns";
import MapPicker from "@/Components/MapPicker";
import { address } from "@/data";
import axios from "axios";
import { IoIosCloseCircle, IoMdClose } from "react-icons/io";
import { LuPhone, LuUser, LuClock } from "react-icons/lu";
import { MdOutlineMail } from "react-icons/md";
import { FiBox } from "react-icons/fi";

export default function BookingForms({
    product,
    onClose,
    isAddToCart,
    phoneNumber,
    quantity,
    isExtend = false,
    extendAddress,
}) {
    const { auth } = usePage().props;
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [dateError, setDateError] = useState("");
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
    });

    const { data, setData, post, processing, errors } = useForm({
        quantity: quantity || 1,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
        pickup_method: "pickup", 
        pickup_time: "09:00",
        return_time: "17:00",
        pickupAddress: isExtend
            ? extendAddress
            : address && address.length > 0
            ? address[0].value
            : "",
        userName: auth.user.name || "",
        email: auth.user.email || "",
        phoneNumber: phoneNumber || "",
    });

    
    // Function to receive address from MapPicker
    const handleAddressSelect = (fullAddress) => {
        setData("pickupAddress", fullAddress);
    };

    useEffect(() => {
        axios
            .get(`/products/${product.id}/check-availability`, {
                params: {
                    start_date: data.start_date,
                    end_date: data.end_date,
                },
            })
            .then((response) => {
                if (response.data.error) {
                    console.log("Availability Error:", response.data.error);
                } else {
                    setUnavailableDates(response.data.unavailable_dates || []);
                }
            })
            .catch((error) =>
                console.log("Error fetching availability:", error)
            );
    }, [product.id]);

    const disabledDates = unavailableDates.flatMap((range) => {
        const start = parse(range.start_date, "yyyy-MM-dd", new Date());
        const end = parse(range.end_date, "yyyy-MM-dd", new Date());
        return eachDayOfInterval({ start, end });
    });

    const validateRange = (start, end) => {
        const selectedDates = eachDayOfInterval({
            start: parse(start, "yyyy-MM-dd", new Date()),
            end: parse(end, "yyyy-MM-dd", new Date()),
        });

        for (const date of selectedDates) {
            if (
                disabledDates.some(
                    (disabledDate) => disabledDate.getTime() === date.getTime()
                )
            ) {
                return false;
            }
        }
        return true;
    };

    const handleDateChange = (ranges) => {
        const start = format(ranges.selection.startDate, "yyyy-MM-dd");
        const end = format(ranges.selection.endDate, "yyyy-MM-dd");

        if (!validateRange(start, end)) {
            setDateError(
                "Selected dates overlap with unavailable dates. Please choose a different range."
            );
            return;
        }

        setDateError("");
        setDateRange({
            startDate: ranges.selection.startDate,
            endDate: ranges.selection.endDate,
            key: "selection",
        });
        setData({
            ...data,
            start_date: start,
            end_date: end,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (dateError) {
            return;
        }

        const url = isAddToCart
            ? `/products/${product.id}/add-to-cart`
            : `/products/${product.id}/book-now`;

        post(url, {
            onSuccess: (response) => {
                onClose();
                if (isAddToCart) {
                    window.location.href = "/cart";
                } else {
                    const orderId = response.props.order.id;
                    window.location.href = `/checkout/${orderId}`;
                }
            },
            onError: (errors) => console.log("Errors:", errors),
        });
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        
        if (value === '') {
            setData('quantity', '');
            return;
        }

        const newQuantity = parseInt(value);
        
        // Validate after user finishes typing
        if (!isNaN(newQuantity)) {
            if (newQuantity > product.stock) {
                setData('quantity', product.stock);
            } else if (newQuantity < 1) {
                setData('quantity', 1);
            } else {
                setData('quantity', newQuantity);
            }
        }
    };

    return (
        <div className="border border-dark rounded-xl overflow-hidden pb-4 md:pb-8 bg-white absolute top-0 md:top-10 left-0 right-0 laptop:w-fit mx-auto z-[100]">
            <div div className="flex justify-between items-center px-4 mb-5 w-full h-14 w bg-dark">
                <h3 className="text-xl font-bold text-center text-white">Booking Form - <span className="text-[#FFD152]">{product.name}</span></h3>
                <button onClick={onClose}>
                    <IoIosCloseCircle className="w-10 h-10 text-white"/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 mx-5 md:mx-8">
                <div className="flex flex-col lg:flex-row lg:gap-8 lg:justify-start lg:items-start">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-8 justify-between md:flex-row">
                            <div className="flex flex-col gap-4 w-full md:w-1/2 md:gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold md:text-base">Nama</label>
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={data.userName}
                                            onChange={(e) => setData("userName", e.target.value)}
                                            maxLength={25}
                                            required
                                            placeholder="tambahkan nama"
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                        <LuUser className="absolute right-3 top-1/2 w-5 h-5 -translate-y-1/2 text-thrid/30" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold md:text-base">Email</label>
                                    <div className="relative w-full">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            required
                                            placeholder="tambahkan email"
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                        <MdOutlineMail className="absolute right-3 top-1/2 w-5 h-5 -translate-y-1/2 text-thrid/30"/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold md:text-base">No Hp</label>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            value={data.phoneNumber}
                                            onChange={(e) => setData("phoneNumber", e.target.value)}
                                            required
                                            placeholder="tambahkan no hp"
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                        <LuPhone className="absolute right-3 top-1/2 w-5 h-5 -translate-y-1/2 text-thrid/30"/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold md:text-base">Quantity:</label>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            value={data.quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            max={product.stock}
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                        <FiBox className="absolute right-3 top-1/2 w-5 h-5 -translate-y-1/2 text-thrid/30" />
                                        
                                    </div>
                                    <span className="text-sm text-secondary">Sisa stock: {product.stock}</span>
                                    {errors.quantity && <span>{errors.quantity}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 lg:max-w-[392px]">
                                <label className="text-sm font-semibold md:text-base">Select Date Range:</label>
                                <DateRange
                                    ranges={[dateRange]}
                                    onChange={handleDateChange}
                                    disabledDates={disabledDates}
                                    minDate={new Date()}
                                    dateDisplayFormat="yyyy-MM-dd"
                                    className="overflow-hidden rounded-xl border w-fit"
                                    direction="vertical"
                                    rangeColors={['#2D5D7C']}
                                    color="#2D5D7C"
                                    
                                />
                                {dateError && (
                                    <span style={{ color: "red" }}>{dateError}</span>
                                )}
                                {errors.start_date && <span>{errors.start_date}</span>}
                                {errors.end_date && <span>{errors.end_date}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold md:text-base">Jam Pengambilan</label>
                                    <div className="relative w-full">
                                        <input
                                            type="time"
                                            value={data.pickup_time}
                                            onChange={(e) => setData("pickup_time", e.target.value)}
                                            min="08:00"
                                            max="20:00"
                                            required
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                    </div>
                                    <span className="text-xs text-thrid/70">Jam operasional: 08:00 - 20:00</span>
                                    <label className="text-sm font-semibold md:text-base">Jam Pengembalian</label>
                                    <div className="relative w-full">
                                        <input
                                            type="time"
                                            value={data.return_time}
                                            onChange={(e) => setData("return_time", e.target.value)}
                                            min="08:00"
                                            max="20:00"
                                            required
                                            className="w-full rounded-xl border border-thrid/20 focus:border-primary focus:ring-0"
                                        />
                                    </div>
                                    <span className="text-xs text-thrid/70">Jam operasional: 08:00 - 20:00</span>
                                </div>
                        </div>

                        {!isExtend && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold md:text-base">Lokasi Pengambilan:</label>
                                <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-0 laptop:gap-8">
                                    <label className={`flex flex-col gap-2 border ${data.pickupAddress === address[0].value && ' border-secondary'} p-5 rounded-3xl`}>
                                        <input
                                            type="radio"
                                            checked={data.pickup_method === "pickup" && data.pickupAddress === address[0].value}
                                            onChange={() => {
                                                setData("pickup_method", "pickup");
                                                setData("pickupAddress", address[0].value);
                                            }}
                                            className="text-secondary focus:ring-acccent"
                                        />
                                        <div className="flex flex-col items-center gap-4 md:max-w-[208px]">
                                            <img src="/icons/Penatih.svg" alt="penatih icon" className={`max-w-[208px] ${data.pickupAddress !== address[0].value && 'grayscale'}`} />
                                            <p className={`${data.pickupAddress === address[0].value && 'text-secondary'} text-center`}>
                                                Konter Penatih
                                                {data.pickupAddress === address[0].value && (
                                                    <p className="text-thrid/50">{address[0].value}</p>
                                                )}
                                            </p>
                                        </div>
                                    </label>
                                    
                                    <label className={`flex flex-col gap-2 border ${data.pickupAddress === address[1].value && ' border-secondary'} p-5 rounded-3xl`}>
                                        <input
                                            type="radio"
                                            checked={data.pickup_method === "pickup" && data.pickupAddress === address[1].value}
                                            onChange={() => {
                                                setData("pickup_method", "pickup");
                                                setData("pickupAddress", address[1].value);
                                            }}
                                            className="text-secondary focus:ring-acccent"
                                        />
                                        <div className="flex flex-col gap-4 items-center">
                                            <img src="/icons/Kayubihi.svg" alt="penatih icon" className={`max-w-[208px] ${data.pickupAddress !== address[1].value && 'grayscale'}`} />
                                            <p className={`${data.pickupAddress === address[1].value && 'text-secondary'} text-center`}>
                                                Konter Kayubihi
                                                {data.pickupAddress === address[1].value && (
                                                    <p className="text-thrid/50">{address[1].value}</p>
                                                )}
                                            </p>
                                        </div>
                                    </label>
                                    <label className={`flex flex-col gap-2 border ${data.pickup_method === "home_delivery" && ' border-secondary'} p-5 rounded-3xl`}>
                                        <input
                                            type="radio"
                                            checked={data.pickup_method === "home_delivery"}
                                            onChange={() => {
                                                setData("pickup_method", "home_delivery");
                                                setData("pickupAddress", "");
                                            }}
                                            className="text-secondary focus:ring-acccent"
                                        />
                                        <div className="flex flex-col gap-4 items-center">
                                            <img src="/icons/Map.svg" alt="penatih icon" className={`max-w-[208px] ${data.pickup_method !== "home_delivery" && 'grayscale'}`} />
                                            <p className={`${data.pickup_method === "home_delivery" && 'text-secondary'}`}>Home Delivery</p>
                                        </div>
                                    </label>
                                </div>

                            </div>
                        )}
                    </div>
                    
                    <div className="-mt-4">
                        {data.pickup_method === "home_delivery" && (
                            <div className="mt-4">
                                <MapPicker
                                    onAddressSelect={handleAddressSelect}
                                    initialAddress={data.pickupAddress}
                                />
                            </div>
                        )}
                        
                        {errors.pickup_method && (
                            <span className="text-red-500">{errors.pickup_method}</span>
                        )}
                        {errors.pickupAddress && (
                            <span className="text-red-500">{errors.pickupAddress}</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-6 md:flex-row md:justify-end">
                    <button className="py-3 w-full text-white rounded-xl bg-primary md:w-1/2 md:order-2 md:max-w-32" type="submit" disabled={processing || dateError}>
                        {isAddToCart ? "Add to Cart" : "Book Now"}
                    </button>
                    <button className="py-3 w-full text-red-700 rounded-xl border border-red-700 md:w-1/2 md:max-w-32" type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
            {/* <div>
                <h4>Unavailable Dates:</h4>
                {unavailableDates.map((range, index) => (
                    <p key={index}>
                        {range.start_date} to {range.end_date}
                    </p>
                ))}
            </div> */}
        </div>
    );
}
