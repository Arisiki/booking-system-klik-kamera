<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('images');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(10);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $categories = ['camera', 'lens', 'tripod', 'lighting', 'audio', 'accessory', 'bundle'];
        $brands = ['canon', 'nikon', 'sony', 'fujifilm', 'panasonic', 'gopro', 'dji', 'other'];

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_per_day' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'brand' => 'required|string',
            'camera_type' => 'nullable|string',
            'images' => 'required|array|min:1|max:3',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Create the product
        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_per_day' => $validated['price_per_day'],
            'stock' => $validated['stock'],
            'category' => $validated['category'],
            'brand' => $validated['brand'],
            'camera_type' => $validated['camera_type'] ?? null,
        ]);

        // Handle multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $imageFile) {
                $path = $imageFile->store('products', 'public');
                
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => $index === 0, // First image is primary
                    'is_active' => $index === 0, // First image is active by default
                ]);
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product)
    {
        $product->load('images', 'equipment', 'reviews.user');
        
        $categories = ['camera', 'lens', 'tripod', 'lighting', 'audio', 'accessory', 'bundle'];
        $brands = ['canon', 'nikon', 'sony', 'fujifilm', 'panasonic', 'gopro', 'dji', 'other'];

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function edit(Product $product)
    {
        $product->load('images');
        
        $categories = ['camera', 'lens', 'tripod', 'lighting', 'audio', 'accessory', 'bundle'];
        $brands = ['canon', 'nikon', 'sony', 'fujifilm', 'panasonic', 'gopro', 'dji', 'other'];

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_per_day' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'brand' => 'required|string',
            'camera_type' => 'nullable|string',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'integer|exists:images,id',
        ]);

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_per_day' => $validated['price_per_day'],
            'stock' => $validated['stock'],
            'category' => $validated['category'],
            'brand' => $validated['brand'],
            'camera_type' => $validated['camera_type'] ?? null,
        ]);

        // Remove images if requested
        if ($request->has('remove_images')) {
            foreach ($request->remove_images as $imageId) {
                $image = Image::find($imageId);
                if ($image && $image->imageable_id == $product->id) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                }
            }
        }

        // Add new images
        if ($request->hasFile('images')) {
            $currentImagesCount = $product->images()->count();
            $newImagesCount = count($request->file('images'));
            
            if ($currentImagesCount + $newImagesCount <= 3) {
                foreach ($request->file('images') as $imageFile) {
                    $path = $imageFile->store('products', 'public');
                    
                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => $product->images()->count() === 0, // Primary if it's the only image
                        'is_active' => false,
                    ]);
                }
            }
        }

        return redirect()->route('admin.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Delete associated images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }
        
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    public function setPrimaryImage(Product $product, Image $image)
    {
        // Verify the image belongs to this product
        if ($image->imageable_id !== $product->id || $image->imageable_type !== Product::class) {
            return response()->json(['error' => 'Image does not belong to this product'], 403);
        }
    
        // Reset all images to non-primary
        $product->images()->update(['is_primary' => false]);
        
        // Set the selected image as primary
        $image->update(['is_primary' => true]);
        
        return response()->json(['success' => true]);
    }
}