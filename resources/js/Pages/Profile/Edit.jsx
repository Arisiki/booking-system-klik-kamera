import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <main className="relative mb-0">
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

                        <div className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl ">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Hapus Akun
                            </h2>
                            <p className="text-thrid mb-4">
                                Setelah akun Anda dihapus, semua data dan sumber daya akan dihapus secara permanen.
                            </p>
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
            </section>
            
            <Footer />
        </main>
    );
}