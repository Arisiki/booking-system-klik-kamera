import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-16 lg:py-20">
            <Head title="Email Verification" />
            
            {/* Background decorative elements */}
            <div className="absolute left-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
            
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 md:px-8">
                <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg md:max-w-lg z-10">
                    <div className="bg-primary px-6 py-4 text-white md:px-8 md:py-5">
                        <h1 className="text-2xl font-bold md:text-3xl">Klik Kamera</h1>
                        <p className="mt-1 text-sm text-white/80 md:text-base">Email Verification</p>
                    </div>
                    
                    <div className="px-6 py-8 md:px-8">
                        <div className='w-64 h-64 mb-10 mx-auto'>
                            <a href="https://storyset.com/people"></a>
                            <img src="/EmailIlustration.svg" alt="email-ilustration" />
                        </div>
                        <div className="mb-4 text-sm text-gray-600">
                            Thanks for signing up! Before getting started, could you verify
                            your email address by clicking on the link we just emailed to
                            you? If you didn't receive the email, we will gladly send you
                            another.
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-600">
                                A new verification link has been sent to the email address
                                you provided during registration.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="flex items-center justify-between pt-4">
                                <PrimaryButton 
                                    className="justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70" 
                                    disabled={processing}
                                >
                                    {processing ? 'Sending...' : 'Resend Verification Email'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
                
                <p className="mt-8 text-center text-xs text-third md:text-sm">
                    &copy; {new Date().getFullYear()} Klik Kamera. All rights reserved.
                </p>
            </div>
            <img src="/background.jpg" alt="" className='absolute top-0 object-cover h-full w-full opacity-50 blur-sm' />
        </main>
    );
}
