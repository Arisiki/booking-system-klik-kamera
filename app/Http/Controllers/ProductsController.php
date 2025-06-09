<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Log;

class ProductsController extends Controller
{
    /**
     * Display a listing of the products.
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->when($request->category, fn($query, $category) => $query->where('category', $category))
            ->when($request->camera_type, fn($query, $cameraType) => $query->where('camera_type', $cameraType))
            ->when($request->brand, fn($query, $brand) => $query->where('brand', $brand))
            ->when($request->search, fn($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->with('images')
            ->orderBy('name')
            ->get();


        $categories = Product::select('category')->distinct()->pluck('category');
        $cameraTypes = Product::whereNotNull('camera_type')->select('camera_type')->distinct()->pluck('camera_type');
        $brands = Product::select('brand')->distinct()->pluck('brand');


        return Inertia::render('Products/AllProducts', [
            'products' => $products,
            'filters' => $request->only(['category', 'camera_type', 'brand', 'search']),
            'categories' => $categories,
            'cameraTypes' => $cameraTypes,
            'brands' => $brands,
        ]);
    }

    /**
     * Display the specified product.
     * @param \App\Models\Product $product
     * @return \Inertia\Response
     */
    public function show(Product $product)
    {
        $product->load('reviews.user', 'images', 'equipment');
        
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->with('images')
            ->take(3)
            ->get();
        
        return Inertia::render('Products/DetailProduct', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }

    public function showCameras(Request $request)
    {
        $products = Product::query()
            ->where('category', 'camera')
            ->when($request->camera_type, fn($query, $cameraTypes) => $query->where('camera_type', $cameraTypes))
            ->when($request->brand, fn($query, $brand) => $query->where('brand', $brand))
            ->with('images')
            ->get();

        $cameraTypes = Product::whereNotNull('camera_type')->select('camera_type')->distinct()->pluck('camera_type');
        $brand = Product::select('brand')->distinct()->pluck('brand');

        return Inertia::render('Products/Cameras', [
            'products' => $products,
            'cameraTypes' => $cameraTypes,
            'brand' => $brand
        ]);
    }

    public function showAccecories(Request $request)
    {
        $products = Product::query()
            ->where('category', '!=', 'camera')
            ->where('category', '!=', 'bundle')
            ->when($request->brand, fn($query, $brand) => $query->where('brand', $brand))
            ->with('images')
            ->get();

        $brand = Product::select('brand')->distinct()->pluck('brand');

        return Inertia::render('Products/Accecories', [
            'products' => $products,
            'brand' => $brand
        ]);
    }

    public function showRecomendations(Request $request) {
        $products = Product::query()
            ->where('category', 'camera')
            ->where('camera_type', 'mirrorless')
            ->with('images')
            ->get();


        return Inertia::render('Home', [
            'products' => $products
        ]);
    }
}
