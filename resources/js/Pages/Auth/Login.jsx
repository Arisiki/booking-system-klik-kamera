import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 md:py-16 lg:py-20">
            <Head title="Log in" />
            
            {/* Background decorative elements */}
            <div className="absolute left-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
            
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 md:px-8">
                {/* <div className="mb-10 w-full max-w-[220px] md:max-w-[260px] lg:max-w-[300px]">
                    <img src="/klik-kamera.jpg" alt="Klik Kamera Logo" className="w-full object-contain drop-shadow-md" />
                </div> */}
                
                <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg md:max-w-lg z-10">
                    <div className="bg-primary px-6 py-4 text-white md:px-8 md:py-5">
                        <h1 className="text-2xl font-bold md:text-3xl">Klik Kamera</h1>
                        <p className="mt-1 text-sm text-white/80 md:text-base">Sign in to your account to continue</p>
                    </div>
                    
                    <div className="px-6 py-8 md:px-8">
                        {status && (
                            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-600">
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
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-medium" />
                                    
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-primary hover:text-primary/80 hover:underline md:text-sm"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />

                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData('remember', e.target.checked)
                                        }
                                        className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/30 focus:ring-opacity-50"
                                    />
                                    <span className="ms-2 text-sm text-gray-600">
                                        Remember me
                                    </span>
                                </label>
                            </div>
                            
                            <div className="pt-4">
                                <PrimaryButton 
                                    className="w-full justify-center rounded-xl bg-primary px-6 py-3.5 text-center font-bold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 md:text-lg" 
                                    disabled={processing}
                                >
                                    {processing ? 'Signing in...' : 'Sign in'}
                                </PrimaryButton>
                            </div>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">Don't have an account?</p>
                            <Link
                                href={route('register')}
                                className="mt-1 inline-block font-medium text-primary hover:text-primary/80 hover:underline"
                            >
                                Create new account
                            </Link>
                        </div>
                    </div>
                </div>
                
                <p className="mt-8 text-center text-xs text-third md:text-sm">
                    &copy; {new Date().getFullYear()} Klik Kamera. All rights reserved.
                </p>
            </div>
            <img src="/background.jpg" alt="" className='absolute top-0 object-cover h-full w-full opacity-80' />
        </main>
    );
}
