import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';
import Footer from '@/Layouts/Footer';

export default function QualityControl() {
    const { order, products, checklists } = usePage().props;

    // Debugging: Periksa nilai products dan checklists
    console.log('Products:', products);
    console.log('Checklists:', checklists);

    const [results, setResults] = useState(
        products.map(product => {
            console.log('Product Category:', product.category);
            const categoryChecklist = checklists[product.category] || checklists['default'];
            return {
                product_id: product.id,
                category: product.category,
                checklist: Object.keys(categoryChecklist).reduce((acc, key) => {
                    acc[key] = categoryChecklist[key].options[0];
                    return acc;
                }, {}),
                status: 'Layak Digunakan',
                notes: '',
            };
        })
    );

    const handleChecklistChange = (productIndex, key, value) => {
        const newResults = [...results];
        newResults[productIndex].checklist[key] = value;
        setResults(newResults);
    };

    const handleStatusChange = (productIndex, value) => {
        const newResults = [...results];
        newResults[productIndex].status = value;
        setResults(newResults);
    };

    const handleNotesChange = (productIndex, value) => {
        const newResults = [...results];
        newResults[productIndex].notes = value;
        setResults(newResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(`/orders/${order.id}/qc`, { results }, {
            onSuccess: () => {
                alert('QC submitted successfully!');
            },
            onError: (errors) => {
                alert('Failed to submit QC: ' + (errors.error || 'Unknown error'));
            },
        });
    };

    return (
        <main className="relative mb-0">
            <Navbar />
            <section className="section-container mt-6 mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                    Quality Control for Order #{order.id}
                </h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 laptop:grid laptop:grid-cols-2">
                    {products.map((product, productIndex) => {
                        const categoryChecklist = checklists[product.category] || checklists['default'];
                        return (
                            <div key={product.id} className="bg-white p-4 md:p-6 border border-thrid/10 rounded-xl">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                                    <h2 className="text-xl font-bold text-primary">
                                        {product.name}
                                    </h2>
                                    <span className="px-3 py-1 bg-acccent rounded-full text-primary text-sm">
                                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {Object.entries(categoryChecklist).map(([key, checklist]) => (
                                        <div key={key} className="bg-acccent/50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-primary mb-2">
                                                {checklist.label}
                                            </label>
                                            <div className="flex flex-wrap gap-4">
                                                {checklist.options.map(option => (
                                                    <label key={option} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`${product.id}-${key}`}
                                                            value={option}
                                                            checked={results[productIndex].checklist[key] === option}
                                                            onChange={() => handleChecklistChange(productIndex, key, option)}
                                                            className="mr-2 accent-primary text-primary"
                                                        />
                                                        <span className="text-thrid">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Status Barang
                                        </label>
                                        <select
                                            value={results[productIndex].status}
                                            onChange={(e) => handleStatusChange(productIndex, e.target.value)}
                                            className="w-full p-2 border border-thrid/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="Layak Digunakan">Layak Digunakan</option>
                                            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                                            <option value="Tidak Layak">Tidak Layak</option>
                                        </select>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-primary mb-2">
                                            Catatan Tambahan
                                        </label>
                                        <textarea
                                            value={results[productIndex].notes}
                                            onChange={(e) => handleNotesChange(productIndex, e.target.value)}
                                            className="w-full p-2 border border-thrid/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            rows="3"
                                            placeholder="Masukkan catatan tambahan (opsional)"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium max-h-fit laptop:mt-auto"
                        >
                            Submit Quality Control
                        </button>
                    </div>
                </form>
            </section>
            <Footer />
        </main>
    );
}