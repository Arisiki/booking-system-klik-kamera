<!DOCTYPE html>
<html>
<head>
    <title>Order Cancelled</title>
</head>
<body>
    <h1>Order Cancelled</h1>
    <p>Dear {{ $order->user_name }},</p>
    <p>We regret to inform you that your order (ID: {{ $order->id }}) has been cancelled because the payment was not completed within 3 hours.</p>
    <p>Order Details:</p>
    <ul>
        <li>Order Date: {{ $order->order_date }}</li>
        <li>Total Cost: Rp {{ number_format($order->total_cost, 0, ',', '.') }}</li>
    </ul>
    <p>If you have any questions, please contact us at support@klikkamera.com.</p>
    <p>Thank you,</p>
    <p>Klik Kamera Team</p>
</body>
</html>