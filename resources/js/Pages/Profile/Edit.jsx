import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <main className=" mb-0">
            <Head title="Profile" />
            <Navbar />
            
            <section className="section-container mt-6 mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                    Profil Pengguna
                </h1>
                
                    <div className="flex flex-col gap-6 laptop:grid laptop:grid-cols-2">
                        <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Informasi Profil
                            </h2>
                            <p className="text-thrid mb-4">
                                Perbarui informasi profil dan alamat email akun Anda.
                            </p>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Ubah Kata Sandi
                            </h2>
                            <p className="text-thrid mb-4">
                                Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk tetap aman.
                            </p>
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        {/* Add new Orders card */}
                        <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Pesanan Saya
                            </h2>
                            <p className="text-thrid mb-4">
                                Lihat riwayat pesanan dan status pesanan Anda.
                            </p>
                            <Link
                                href={route('orders.show')}
                                className="px-4 w-fit h-fit py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                Lihat Pesanan
                            </Link>
                        </div>

                        {/* <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Hapus Akun
                            </h2>
                            <p className="text-thrid mb-4">
                                Setelah akun Anda dihapus, semua data dan sumber daya akan dihapus secara permanen.
                            </p>
                            <DeleteUserForm className="max-w-xl" />
                        </div> */}
                        <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Logout
                            </h2>
                            <p className="text-thrid mb-4">
                                Setelah logout anda tidak bisa melakukan pesanan.
                            </p>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="px-4 w-fit h-fit py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Log Out
                            </Link>
                        </div>
                        
                    </div>
            </section>
            
            <Footer />
        </main>
    );
}