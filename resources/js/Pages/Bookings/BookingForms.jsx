import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, parse, addDays, eachDayOfInterval } from 'date-fns'; 
import MapPicker from '@/Components/MapPicker';
import { address } from '@/data';

export default function BookingForms({ product, onClose, isAddToCart }) {
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [dateError, setDateError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });

    const { data, setData, post, processing, errors } = useForm({
        quantity: 1,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        pickup_method: 'pickup',
        pickupAddress: address && address.length > 0 ? address[0].value : ''
    });

    // Update pickupAddress when pickup_method changes
    useEffect(() => {
        if (data.pickup_method === 'cod') {
            setData('pickupAddress', ''); 
        } else {
            setData('pickupAddress', address && address.length > 0 ? address[0].value : '');
        }
    }, [data.pickup_method]);

    // Function to receive address from MapPicker
    const handleAddressSelect = (fullAddress) => {
        setData('pickupAddress', fullAddress);
    };

    useEffect(() => {
        fetch(`/products/${product.id}/check-availability?start_date=${data.start_date}&end_date=${data.end_date}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.log('Availability Error:', data.error);
                } else {
                    setUnavailableDates(data.unavailable_dates || []);
                }
            })
            .catch(error => console.log('Error fetching availability:', error));
    }, [product.id]);

    const disabledDates = unavailableDates.flatMap(range => {
        const start = parse(range.start_date, 'yyyy-MM-dd', new Date());
        const end = parse(range.end_date, 'yyyy-MM-dd', new Date());
        return eachDayOfInterval({ start, end });
    });

    const validateRange = (start, end) => {
        const selectedDates = eachDayOfInterval({
            start: parse(start, 'yyyy-MM-dd', new Date()),
            end: parse(end, 'yyyy-MM-dd', new Date()),
        });

        for (const date of selectedDates) {
            if (disabledDates.some(disabledDate => disabledDate.getTime() === date.getTime())) {
                return false; 
            }
        }
        return true; 
    };

    const handleDateChange = (ranges) => {
        const start = format(ranges.selection.startDate, 'yyyy-MM-dd');
        const end = format(ranges.selection.endDate, 'yyyy-MM-dd');

        if (!validateRange(start, end)) {
            setDateError('Selected dates overlap with unavailable dates. Please choose a different range.');
            return;
        }

        setDateError('');
        setDateRange({
            startDate: ranges.selection.startDate,
            endDate: ranges.selection.endDate,
            key: 'selection',
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
                    window.location.href = '/cart';
                } else {
                    const orderId = response.props.order.id;
                    window.location.href = `/checkout/${orderId}`;
                }
            },
            onError: (errors) => console.log('Errors:', errors),
        });
    };

    return (
        <div>
            <h3>Booking Form for {product.name}</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', parseInt(e.target.value))}
                        min="1"
                        max={product.stock}
                    />
                    {errors.quantity && <span>{errors.quantity}</span>}
                </div>
                <div>
                    <label>Select Date Range:</label>
                    <DateRange
                        ranges={[dateRange]}
                        onChange={handleDateChange}
                        disabledDates={disabledDates}
                        minDate={new Date()}
                        dateDisplayFormat="yyyy-MM-dd"
                    />
                    {dateError && <span style={{ color: 'red' }}>{dateError}</span>}
                    {errors.start_date && <span>{errors.start_date}</span>}
                    {errors.end_date && <span>{errors.end_date}</span>}
                </div>
                
                <div>
                    <label>Pickup Method:</label>
                    <div>
                        <label>
                            <input
                                type="radio"
                                value="pickup"
                                checked={data.pickup_method === 'pickup'}
                                onChange={() => setData('pickup_method', 'pickup')}
                            />
                            Pickup
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="cod"
                                checked={data.pickup_method === 'cod'}
                                onChange={() => setData('pickup_method', 'cod')}
                            />
                            COD (Cash on Delivery)
                        </label>
                    </div>
                    {errors.pickup_method && <span>{errors.pickup_method}</span>}
                </div>

                {/* Address selection section */}
                {data.pickup_method === 'pickup' ? (
                    <div>
                        <label>
                            Pilih Alamat:
                            <select
                                value={data.pickupAddress}
                                onChange={(e) => setData('pickupAddress', e.target.value)}
                            >
                                {address.map((addr, index) => (
                                    <option key={index} value={addr.value}>
                                        {addr.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.pickupAddress && <span>{errors.pickupAddress}</span>}
                    </div>
                ) : (
                    <div>
                        <MapPicker 
                            onAddressSelect={handleAddressSelect} 
                            initialAddress={data.pickupAddress} 
                        />
                        {errors.pickupAddress && <span>{errors.pickupAddress}</span>}
                    </div>
                )}
                
                <button type="submit" disabled={processing || dateError}>
                    {isAddToCart ? 'Add to Cart' : 'Book Now'}
                </button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
            <div>
                <h4>Unavailable Dates:</h4>
                {unavailableDates.map((range, index) => (
                    <p key={index}>
                        {range.start_date} to {range.end_date}
                    </p>
                ))}
            </div>
        </div>
    );
}