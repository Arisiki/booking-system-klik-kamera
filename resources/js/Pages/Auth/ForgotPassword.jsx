import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-16 lg:py-20">
            <Head title="Forgot Password" />
            
            {/* Background decorative elements */}
            <div className="absolute left-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
            
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 md:px-8">
                <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg md:max-w-lg z-10">
                    <div className="bg-primary px-6 py-4 text-white md:px-8 md:py-5">
                        <h1 className="text-2xl font-bold md:text-3xl">Reset Password</h1>
                        <p className="mt-1 text-sm text-white/80 md:text-base">We'll send you a link to reset your password</p>
                    </div>
                    
                    <div className="px-6 py-8 md:px-8">
                        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-primary/50 shadow-sm">
                            <p>Forgot your password? No problem. Enter your email address below and we'll send you a password reset link to create a new one.</p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-lg border border-green-100 bg-green-50/70 p-4 text-sm font-medium text-green-700 shadow-sm">
                                {status}
                            </div>
                        )}
                        
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-medium" />

                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            
                            <div className="pt-4">
                                <PrimaryButton 
                                    className="w-full justify-center rounded-xl bg-primary px-6 py-3.5 text-center font-bold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 md:text-lg" 
                                    disabled={processing}
                                >
                                    {processing ? 'Sending...' : 'Email Password Reset Link'}
                                </PrimaryButton>
                            </div>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">Remember your password?</p>
                            <Link
                                href={route('login')}
                                className="mt-1 inline-block font-medium text-primary hover:text-primary/80 hover:underline"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
                
                <p className="mt-8 text-center text-xs text-gray-500 md:text-sm">
                    &copy; {new Date().getFullYear()} Klik Kamera. All rights reserved.
                </p>
            </div>

            <img src="/background.jpg" alt="" className='absolute top-0 object-cover h-full w-full opacity-80' />
        </main>
    );
}
