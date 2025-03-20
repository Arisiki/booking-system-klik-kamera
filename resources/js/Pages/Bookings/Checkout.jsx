import React from 'react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Checkout() {
    const { order, clientKey, snapToken, productItems } = usePage().props;
    const [isSnapReady, setIsSnapReady] = useState(false);
  
    console.log(order);
    
    
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

      useEffect(() => {
        if(isSnapReady && snapToken && window.snap)
        {
            setTimeout(() => {
                handlePayment();
            }, 500)
        }

      }, [isSnapReady])

     

    return (
        <div className='flex gap-2'>
            <div>
                <h1 className='text-2xl font-bold'>Checkout</h1>
                <h3>Order Details</h3>
                <p>Order Date: {new Date(order.order_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year:'numeric'
                })}</p>
                <p>Start Date: {new Date(order.start_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year:'numeric'
                })}</p>
                <p>End Date: {new Date(order.end_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year:'numeric'
                })}</p>
                <p>Pickup Method: {order.pickup_method}</p>
                <p>Total Cost: Rp {order.total_cost}</p>
                <p>Status: {order.status}</p>

                
            </div>
            <div>
                <h3>Order Items</h3>
                {order.order_items.map((item, index) => (
                    <div key={index}>
                        <p>Product: {item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Rental Cost: Rp {item.rental_cost}</p>
                        <p>Pick Up Address: {item.address}</p>
                    </div>
                ))}
            </div>
            

            <div id='snap-container' className='w-1/2'>
                
            </div> 
        </div>
    );
}