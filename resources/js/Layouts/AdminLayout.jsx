import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { FiHome, FiUsers, FiShoppingBag, FiClipboard, FiLogOut } from 'react-icons/fi';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
                <div className="flex items-center justify-center h-16 px-4 border-b">
                    <ApplicationLogo className="w-12 h-12" />
                    <span className="ml-2 text-xl font-semibold">Klik Kamera</span>
                </div>
                <div className="p-4">
                    <p className="mb-4 text-sm text-gray-500">Admin Panel</p>
                    <nav className="flex flex-col gap-8">
                        <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                            <FiHome className="w-5 h-5 mr-3" />
                            Dashboard
                        </NavLink>
                        <NavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                            <FiUsers className="w-5 h-5 mr-3" />
                            Users
                        </NavLink>
                        <NavLink href={route('admin.products.index')} active={route().current('admin.products.*')}>
                            <FiShoppingBag className="w-5 h-5 mr-3" />
                            Products
                        </NavLink>
                        <NavLink href={route('admin.orders.index')} active={route().current('admin.orders.*')}>
                            <FiClipboard className="w-5 h-5 mr-3" />
                            Orders
                        </NavLink>
                        <NavLink href={route('admin.availability.index')}>
                            <FiClipboard className="w-5 h-5 mr-3" />
                            Availability
                        </NavLink>
                        
                    </nav>
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 mr-3 overflow-hidden bg-gray-300 rounded-full">
                            <div className="flex items-center justify-center w-full h-full text-gray-600">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <p className="font-medium">{auth.user.name}</p>
                            <p className="text-sm text-gray-500">{auth.user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center w-full px-4 py-2 text-left rounded hover:bg-gray-100"
                    >
                        <FiLogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-6 bg-white shadow">
                    <h1 className="text-xl font-semibold">Admin Panel</h1>
                </header>

                {/* Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}