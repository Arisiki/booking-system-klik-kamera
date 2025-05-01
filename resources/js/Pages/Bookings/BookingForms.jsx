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
import { LuPhone, LuUser } from "react-icons/lu";
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
        pickupAddress: isExtend
            ? extendAddress
            : address && address.length > 0
            ? address[0].value
            : "",
        userName: auth.user.name || "",
        email: auth.user.email || "",
        phoneNumber: phoneNumber || "",
    });

    console.log(product);
    
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
        <div className="border  border-dark rounded-xl overflow-hidden pb-4 md:pb-8 bg-white absolute top-4 left-0 right-0 laptop:w-fit  mx-auto z-50">
            <div div className="w-full w h-14 bg-dark flex items-center justify-between mb-5 px-4">
                <h3 className="text-xl text-white font-bold text-center">Booking Form - <span className="text-[#FFD152]">{product.name}</span></h3>
                <button onClick={onClose}>
                    <IoIosCloseCircle className="text-white h-10 w-10"/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mx-5 flex flex-col gap-8 md:mx-8">
                <div className="flex flex-col lg:flex-row lg:gap-8 lg:justify-start lg:items-start">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-8 md:flex-row justify-between">
                            <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm md:text-base font-semibold">Nama</label>
                                    <div className="w-full relative">
                                        <input
                                            type="text"
                                            value={data.userName}
                                            onChange={(e) => setData("userName", e.target.value)}
                                            maxLength={25}
                                            required
                                            placeholder="tambahkan nama"
                                            className="rounded-xl border border-thrid/20 w-full focus:border-primary focus:ring-0"
                                        />
                                        <LuUser className="absolute right-3 top-1/2 -translate-y-1/2 text-thrid/30 w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm md:text-base font-semibold">Email</label>
                                    <div className="w-full relative">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            required
                                            placeholder="tambahkan email"
                                            className="rounded-xl border border-thrid/20 w-full focus:border-primary focus:ring-0"
                                        />
                                        <MdOutlineMail className="absolute right-3 top-1/2 -translate-y-1/2 text-thrid/30 w-5 h-5"/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm md:text-base font-semibold">No Hp</label>
                                    <div className="w-full relative">
                                        <input
                                            type="number"
                                            value={data.phoneNumber}
                                            onChange={(e) => setData("phoneNumber", e.target.value)}
                                            required
                                            placeholder="tambahkan no hp"
                                            className="rounded-xl border border-thrid/20 w-full focus:border-primary focus:ring-0"
                                        />
                                        <LuPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-thrid/30 w-5 h-5"/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm md:text-base font-semibold">Quantity:</label>
                                    <div className="w-full relative">
                                        <input
                                            type="number"
                                            value={data.quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            max={product.stock}
                                            className="rounded-xl border border-thrid/20 w-full focus:border-primary focus:ring-0"
                                        />
                                        <FiBox className="absolute right-3 top-1/2 -translate-y-1/2 text-thrid/30 w-5 h-5" />
                                        
                                    </div>
                                    <span className="text-secondary text-sm">Sisa stock: {product.stock}</span>
                                    {errors.quantity && <span>{errors.quantity}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 lg:max-w-[392px]">
                                <label className="text-sm md:text-base font-semibold">Select Date Range:</label>
                                <DateRange
                                    ranges={[dateRange]}
                                    onChange={handleDateChange}
                                    disabledDates={disabledDates}
                                    minDate={new Date()}
                                    dateDisplayFormat="yyyy-MM-dd"
                                    className="w-fit overflow-hidden border rounded-xl"
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
                        </div>

                        {!isExtend && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm md:text-base font-semibold">Lokasi Pengambilan:</label>
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
                                        <div className="flex flex-col items-center gap-4">
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
                                        <div className="flex flex-col items-center gap-4">
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

                <div className="flex flex-col gap-4 md:flex-row md:justify-end mt-6">
                    <button className="bg-primary text-white w-full md:w-1/2  rounded-xl py-3 md:order-2 md:max-w-32" type="submit" disabled={processing || dateError}>
                        {isAddToCart ? "Add to Cart" : "Book Now"}
                    </button>
                    <button className="border border-red-700 w-full md:w-1/2 rounded-xl py-3 text-red-700 md:max-w-32" type="button" onClick={onClose}>
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
