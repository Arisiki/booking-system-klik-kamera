import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
                            
                            <p>Welcome to the Klik Kamera admin panel. Use the sidebar to navigate to different sections.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}