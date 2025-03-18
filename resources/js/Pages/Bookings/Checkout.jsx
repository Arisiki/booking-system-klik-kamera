import React from 'react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Checkout() {
    const { order, clientKey, snapToken } = usePage().props;
    const [isSnapReady, setIsSnapReady] = useState(false);
    
    useEffect(() => {
        // You can also change below url value to any script url you wish to load, 
        // for example this is snap.js for Sandbox Env (Note: remove `.sandbox` from url if you want to use production version)
        const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';  
      
        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
      
        // Optional: set script attribute, for example snap.js have data-client-key attribute 
        // (change the value according to your client-key)
        const myMidtransClientKey = clientKey;
        scriptTag.setAttribute('data-client-key', myMidtransClientKey);
      
        scriptTag.onload = () => {
            setIsSnapReady(true);
        }

        document.body.appendChild(scriptTag);
      
        return () => {
          document.body.removeChild(scriptTag);
        }
      }, [clientKey]);

      

      const handlePayment = () => {
        if(isSnapReady && window.snap) {
            window.snap.embed(snapToken, {
                embedId: 'snap-container',
                onSuccess: function (result) {
                    alert('Payment Success');
                    console.log(result);
                },
                onError: function (result) {
                    alert('Payment failed')
                    console.log(result)
                },
                onPending: function (result) {
                    alert('Waiting for your Payment...')
                    console.log(result)
                }
            })
        } else {
            console.error('Snap is not ready');
            alert('Payment system is still loading. Please try again in a moment.');
        }
      }

    return (
        <div className='flex gap-2'>
            <div>
                <h1 className='text-2xl font-bold'>Checkout</h1>
                <h3>Order Details</h3>
                <p>Order ID: {order.id}</p>
                <p>User: {order.user.name}</p>
                <p>Order Date: {order.order_date}</p>
                <p>Start Date: {order.start_date}</p>
                <p>End Date: {order.end_date}</p>
                <p>Pickup Method: {order.pickup_method}</p>
                <p>Total Cost: Rp {order.total_cost}</p>
                <p>Status: {order.status}</p>

                <button onClick={handlePayment} disabled={!isSnapReady} className='border px-4 py-2 mt-4'>
                {isSnapReady ? 'Proceed to Payment' : 'Loading Payment System...'}
                </button>
            </div>
            <div>
                <h3>Order Items</h3>
                {order.order_items.map((item, index) => (
                    <div key={index}>
                        <p>Product: {item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Rental Cost: Rp {item.rental_cost}</p>
                    </div>
                ))}
            </div>
            

            <div id='snap-container' className='w-1/2'>
                
            </div> 
        </div>
    );
}