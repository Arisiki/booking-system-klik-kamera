<!DOCTYPE html>
<html>
<head>
    <title>Verify Email - Klik Kamera</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background: #2D5D7C; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Klik Kamera</h1>
            <p style="margin: 5px 0 0;">Email Verification</p>
        </div>
        
        <div style="padding: 20px;">
            <div style="width: 200px; height: 200px; margin: 0 auto 24px;">
                <img src="{{ asset(path: 'EmailIlustration.svg') }}" alt="Email Verification" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            
            <h2 style="color: #2D5D7C;">Hello!</h2>
            <p>Please click the button below to verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $url }}" 
                   style="background: #2D5D7C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Verify Email Address
                </a>
            </div>
            
            <p>If you did not create an account, no further action is required.</p>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
                <a href="{{ $url }}" style="color: #2D5D7C; word-break: break-all;">{{ $url }}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
                &copy; {{ date('Y') }} Klik Kamera. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>