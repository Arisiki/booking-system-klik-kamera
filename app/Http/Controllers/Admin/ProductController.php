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
        
        // Get products with discount data for order creation
        $products = Product::with('images')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price_per_day' => $product->price_per_day,
                'discount_percentage' => $product->discount_percentage,
                'discount_amount' => $product->discount_amount,
                'discount_start_date' => $product->discount_start_date,
                'discount_end_date' => $product->discount_end_date,
                'is_on_sale' => $product->is_on_sale,
                'has_active_discount' => $product->hasActiveDiscount(),
                'discounted_price' => $product->getDiscountedPrice(),
            ];
        });

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
            'brands' => $brands,
            'products' => $products, // Add this for order creation
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
                'is_on_sale' => 'boolean',
                'discount_type' => 'required_if:is_on_sale,true|in:percentage,fixed',
                'discount_percentage' => 'required_if:discount_type,percentage|nullable|numeric|min:0|max:100',
                'discount_amount' => 'required_if:discount_type,fixed|nullable|numeric|min:0',
                'discount_start_date' => 'nullable|date|after_or_equal:today',
                'discount_end_date' => 'nullable|date|after:discount_start_date',
            ]);

            // Create the product
            // Tentukan apakah produk sedang diskon
            $isOnSale = ($validated['discount_percentage'] > 0 || $validated['discount_amount'] > 0) 
                        && !empty($validated['discount_start_date']) 
                        && !empty($validated['discount_end_date']);
            
            $product = Product::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price_per_day' => $validated['price_per_day'],
                'stock' => $validated['stock'],
                'category' => $validated['category'],
                'brand' => $validated['brand'],
                'camera_type' => $validated['camera_type'] ?? null,
                'is_on_sale' => $isOnSale,
                'discount_type' => $validated['discount_type'] ?? 'percentage',
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'discount_start_date' => $validated['discount_start_date'] ?? null,
                'discount_end_date' => $validated['discount_end_date'] ?? null,
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
        try {
            // Add debug logging
            \Log::info('Incoming product update request', [
                'product_id' => $product->id,
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
                'images' => 'nullable|array|max:3',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'remove_images' => 'nullable|array',
                'remove_images.*' => 'integer|exists:images,id',
                'is_on_sale' => 'boolean',
                'discount_type' => 'required_if:is_on_sale,true|in:percentage,fixed',
                'discount_percentage' => 'required_if:discount_type,percentage|nullable|numeric|min:0|max:100',
                'discount_amount' => 'required_if:discount_type,fixed|nullable|numeric|min:0',
                'discount_start_date' => 'nullable|date',
                'discount_end_date' => 'nullable|date|after:discount_start_date',
            ]);
    
            // Tentukan apakah produk sedang diskon
            $isOnSale = ($validated['discount_percentage'] > 0 || $validated['discount_amount'] > 0) 
                        && !empty($validated['discount_start_date']) 
                        && !empty($validated['discount_end_date']);
            
            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price_per_day' => $validated['price_per_day'],
                'stock' => $validated['stock'],
                'category' => $validated['category'],
                'brand' => $validated['brand'],
                'camera_type' => $validated['camera_type'] ?? null,
                'is_on_sale' => $isOnSale,
                'discount_type' => $validated['discount_type'] ?? 'percentage',
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'discount_start_date' => $validated['discount_start_date'] ?? null,
                'discount_end_date' => $validated['discount_end_date'] ?? null,
            ]);
    
            // Handle image removal
            if ($request->has('remove_images')) {
                foreach ($request->remove_images as $imageId) {
                    $image = Image::find($imageId);
                    if ($image && $image->imageable_id == $product->id) {
                        // Delete from storage
                        Storage::disk('public')->delete($image->image_path);
                        
                        // Delete from public_html/storage
                        $publicPath = base_path('../public_html/storage/' . $image->image_path);
                        if (file_exists($publicPath)) {
                            unlink($publicPath);
                        }
                        
                        $image->delete();
                    }
                }
            }
    
            // Handle new images with error checking
            if ($request->hasFile('images')) {
                $currentImagesCount = $product->images()->count();
                $newImagesCount = count($request->file('images'));
                
                if ($currentImagesCount + $newImagesCount <= 3) {
                    foreach ($request->file('images') as $index => $imageFile) {
                        try {
                            if (!$imageFile->isValid()) {
                                throw new \Exception('Invalid file upload: ' . $imageFile->getErrorMessage());
                            }
    
                            // Log file information
                            \Log::info('Processing image file for update', [
                                'original_name' => $imageFile->getClientOriginalName(),
                                'size' => $imageFile->getSize(),
                                'mime' => $imageFile->getMimeType()
                            ]);
    
                            $path = $imageFile->store('products', 'public');
                            
                            // Copy file ke public_html/storage
                            $this->copyToPublicHtml($path);
                            
                            $product->images()->create([
                                'image_path' => $path,
                                'is_primary' => $product->images()->count() === 0,
                                'is_active' => true,
                            ]);
                        } catch (\Exception $e) {
                            \Log::error('Failed to process image during update: ' . $e->getMessage());
                            throw $e;
                        }
                    }
                } else {
                    throw new \Exception('Maximum 3 images allowed per product');
                }
            }
    
            return redirect()->route('admin.products.show', $product)
                ->with('success', 'Product updated successfully.');
                
            } catch (\Exception $e) {
                \Log::error('Product update failed: ' . $e->getMessage());
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['error' => 'Failed to update product: ' . $e->getMessage()]);
            }
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