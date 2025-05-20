<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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

    private function copyToPublicHtml($path)
    {
        try {
            // Path sumber file di storage
            $sourcePath = storage_path('app/public/' . $path);
            
            // Path tujuan di public_html
            $destinationPath = base_path('../public_html/storage/' . $path);
            
            // Pastikan direktori tujuan ada
            $destinationDir = dirname($destinationPath);
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            
            // Copy file
            if (file_exists($sourcePath)) {
                copy($sourcePath, $destinationPath);
                chmod($destinationPath, 0644);
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            \Log::error('Failed to copy file to public_html: ' . $e->getMessage());
            return false;
        }
    }

    public function store(Request $request)
    {
        try {
            // Add debug logging
            \Log::info('Incoming product creation request', [
                'has_files' => $request->hasFile('images'),
                'files_count' => $request->hasFile('images') ? count($request->file('images')) : 0
            ]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price_per_day' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category' => 'required|string',
                'brand' => 'required|string',
                'camera_type' => 'nullable|string',
                'images' => 'required|array|min:1|max:3',
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
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

            // Handle multiple images with error checking
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    try {
                        if (!$imageFile->isValid()) {
                            throw new \Exception('Invalid file upload: ' . $imageFile->getErrorMessage());
                        }

                        // Log file information
                        \Log::info('Processing image file', [
                            'original_name' => $imageFile->getClientOriginalName(),
                            'size' => $imageFile->getSize(),
                            'mime' => $imageFile->getMimeType()
                        ]);

                        $path = $imageFile->store('products', 'public');
                        
                        // Copy file ke public_html/storage
                        $this->copyToPublicHtml($path);
                        
                        $product->images()->create([
                            'image_path' => $path,
                            'is_primary' => $index === 0,
                            'is_active' => true,
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to process image: ' . $e->getMessage());
                        throw $e;
                    }
                }
            }

            return redirect()->route('admin.products.index')
                ->with('success', 'Product created successfully.');

        } catch (\Exception $e) {
            \Log::error('Product creation failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
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
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
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
                    
                    // Copy file ke public_html/storage
                    $this->copyToPublicHtml($path);
                    
                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => $product->images()->count() === 0, 
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
            // Hapus file dari storage
            Storage::disk('public')->delete($image->image_path);
            
            // Hapus file dari public_html/storage
            $publicPath = base_path('../public_html/storage/' . $image->image_path);
            if (file_exists($publicPath)) {
                unlink($publicPath);
            }
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