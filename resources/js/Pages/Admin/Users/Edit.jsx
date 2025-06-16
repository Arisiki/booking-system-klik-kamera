import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditUser({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'user',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                // Reset password fields on success
                setData('password', '');
                setData('password_confirmation', '');
            },
            onError: (errors) => {
                console.error('Update user errors:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit User - ${user.name}`} />
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link
                        href={route('admin.users.index')}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <FiArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-semibold">Edit User: {user.name}</h1>
                </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Role" />
                            <select
                                id="role"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Change Password (Optional)</h3>
                            <p className="text-sm text-gray-600 mb-4">Leave blank to keep current password</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="password" value="New Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm New Password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <Link
                                href={route('admin.users.index')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Updating...' : 'Update User'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}