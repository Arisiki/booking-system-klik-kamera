import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

export default function ShowUser({ user }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AdminLayout>
            <Head title={`User Details - ${user.name}`} />
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link
                        href={route('admin.users.index')}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <FiArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-semibold">User Details</h1>
                </div>
                <div className="flex space-x-2">
                    <Link
                        href={route('admin.users.edit', user.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
                    >
                        <FiEdit className="mr-2" /> Edit
                    </Link>
                    {user.role !== 'admin' && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                        >
                            <FiTrash2 className="mr-2" /> Delete
                        </button>
                    )}
                </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">User Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium mb-4">Account Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-medium">{user.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="font-medium">{moment(user.created_at).format('DD MMMM YYYY, HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{moment(user.updated_at).format('DD MMMM YYYY, HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Verified</p>
                                    <p className="font-medium">
                                        {user.email_verified_at ? (
                                            <span className="text-green-600">Verified</span>
                                        ) : (
                                            <span className="text-red-600">Not Verified</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}