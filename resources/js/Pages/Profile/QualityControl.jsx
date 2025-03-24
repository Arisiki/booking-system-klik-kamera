import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Navbar from '@/Layouts/Navbar';

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
        <div className="container mx-auto p-4">
            <Navbar />
            <h1 className="text-2xl font-bold mb-4">Quality Control for Order #{order.id}</h1>
            <form onSubmit={handleSubmit}>
                {products.map((product, productIndex) => {
                    const categoryChecklist = checklists[product.category] || checklists['default'];
                    return (
                        <div key={product.id} className="mb-6 p-4 border rounded">
                            <h2 className="text-xl font-bold mb-2">{product.name} ({product.category})</h2>
                            {Object.entries(categoryChecklist).map(([key, checklist]) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium mb-1">{checklist.label}</label>
                                    <div className="flex gap-2">
                                        {checklist.options.map(option => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`${product.id}-${key}`}
                                                    value={option}
                                                    checked={results[productIndex].checklist[key] === option}
                                                    onChange={() => handleChecklistChange(productIndex, key, option)}
                                                    className="mr-2"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Status Barang</label>
                                <select
                                    value={results[productIndex].status}
                                    onChange={(e) => handleStatusChange(productIndex, e.target.value)}
                                    className="p-2 border rounded w-full"
                                >
                                    <option value="Layak Digunakan">Layak Digunakan</option>
                                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                                    <option value="Tidak Layak">Tidak Layak</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Catatan Tambahan</label>
                                <textarea
                                    value={results[productIndex].notes}
                                    onChange={(e) => handleNotesChange(productIndex, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    placeholder="Masukkan catatan tambahan (opsional)"
                                ></textarea>
                            </div>
                        </div>
                    );
                })}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Submit QC
                </button>
            </form>
        </div>
    );
}