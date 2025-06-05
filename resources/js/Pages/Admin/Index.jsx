import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { formatRupiah } from '@/utils';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar} from 'recharts';
import { format, subDays, parseISO,} from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard({ stats, recentSales, dailyRevenue }) {
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    
    // Inisialisasi dateRange dengan nilai dari props jika tersedia
    useEffect(() => {
        if (stats && stats.dateRange) {
            setDateRange({
                start: stats.dateRange.start || dateRange.start,
                end: stats.dateRange.end || dateRange.end
            });
        }
    }, [stats]);
    
    const handleDateRangeChange = (e) => {
        setDateRange({
            ...dateRange,
            [e.target.name]: e.target.value
        });
    };
    
    const handleDownload = () => {
        router.get(route('admin.reports.download'), {
            start_date: dateRange.start,
            end_date: dateRange.end
        });
    };
    
    const handleApplyFilter = () => {
        console.log('Filter berhasil diterapkan:', dateRange);
        router.visit(route('admin.dashboard'), {
            data: {
                start_date: dateRange.start,
                end_date: dateRange.end
            },
            preserveState: true,
            replace: true
        });
    };
    
    
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-dark">Dashboard</h1>
                
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateRangeChange}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateRangeChange}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        />
                    </div>
                    
                    <Button onClick={handleApplyFilter} variant="default" className="px-4 py-2 text-white bg-secondary hover:bg-secondary/90">
                        Terapkan
                    </Button>
                    
                    <Button onClick={handleDownload} variant="default" className="px-4 py-2 text-white bg-primary hover:bg-primary/90">
                        Download
                    </Button>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 text-primary">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.totalRevenue)}</div>
                        <p className={`text-xs ${stats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 text-primary">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        <p className={`text-xs ${stats.customerChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.customerChange >= 0 ? '+' : ''}{stats.customerChange}% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 text-primary">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSales}</div>
                        <p className={`text-xs ${stats.salesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.salesChange >= 0 ? '+' : ''}{stats.salesChange}% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 text-primary">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeBookings}</div>
                        <p className="text-xs text-green-500">
                            +{stats.activeChange} sejak jam lalu
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Data dari {format(parseISO(dateRange.start), 'dd MMMM yyyy', { locale: id })} hingga {format(parseISO(dateRange.end), 'dd MMMM yyyy', { locale: id })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-10">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => format(parseISO(value), 'dd MMM')}
                                    interval={7}
                                    tickMargin={15}
                                    
                                />
                                <YAxis 
                                    tickFormatter={(value) => `Rp${value/1000}k`}
                                    
                                />
                                <Tooltip 
                                    formatter={(value) => [`${formatRupiah(value)}`, 'Revenue']}
                                    labelFormatter={(value) => format(parseISO(value), 'dd MMMM yyyy')}
                                />
                                <Bar dataKey="amount" fill="#2D5D7C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                            Anda telah melakukan {stats.monthlySales} penjualan bulan ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSales.map((sale) => (
                                <div className="flex items-center" key={sale.id}>
                                    <Avatar className="w-9 h-9">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {sale.customer_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{sale.customer_name}</p>
                                        <p className="text-sm text-muted-foreground">{sale.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {formatRupiah(sale.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}