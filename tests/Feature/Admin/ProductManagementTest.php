<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use App\Models\Image;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_admin_can_view_products_list()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $products = Product::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.products.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Products/Index')
            ->has('products')
        );
    }

    public function test_admin_can_search_products()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['name' => 'Canon EOS R5']);
        Product::factory()->create(['name' => 'Nikon D850']);

        $response = $this->actingAs($admin)->get(route('admin.products.index', ['search' => 'Canon']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Products/Index')
            ->has('products.data')
        );
    }

    public function test_admin_can_create_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.products.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Products/Create')
            ->has('categories')
            ->has('brands')
        );
    }

    public function test_admin_can_store_new_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $productData = [
            'name' => 'Canon EOS R5',
            'description' => 'Professional mirrorless camera',
            'price_per_day' => 250000,
            'stock' => 5,
            'category' => 'camera',
            'brand' => 'Canon',
            'camera_type' => 'Mirrorless',
            'images' => [
                UploadedFile::fake()->image('camera1.jpg'),
                UploadedFile::fake()->image('camera2.jpg'),
            ]
        ];

        $response = $this->actingAs($admin)->post('/admin/products', $productData);

        $response->assertRedirect(route('admin.products.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('products', [
            'name' => 'Canon EOS R5',
            'description' => 'Professional mirrorless camera',
            'price_per_day' => 250000,
            'stock' => 5,
            'category' => 'camera',
            'brand' => 'Canon',
            'camera_type' => 'Mirrorless'
        ]);

        $product = Product::where('name', 'Canon EOS R5')->first();
        $this->assertCount(2, $product->images);
    }

    public function test_admin_can_update_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        
        $image1 = Image::create([
            'imageable_id' => $product->id,
            'imageable_type' => Product::class,
            'image_path' => 'products/old-image.jpg',
            'is_primary' => true
        ]);

        $updateData = [
            'name' => 'Updated Product',
            'description' => 'Updated description',
            'price_per_day' => 300000,
            'stock' => 10,
            'category' => 'lens',
            'brand' => 'Updated Brand',
            'camera_type' => 'DSLR',
            'images' => [
                UploadedFile::fake()->image('new-image.jpg')
            ]
        ];

        $response = $this->actingAs($admin)
            ->put("/admin/products/{$product->id}", $updateData);

        $response->assertRedirect(route('admin.products.show', $product->id));
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product'
        ]);
    }

    public function test_admin_can_delete_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        
        // Buat image untuk product
        $image = Image::create([
            'imageable_id' => $product->id,
            'imageable_type' => Product::class,
            'image_path' => 'products/test-image.jpg',
            'is_primary' => true,
            'is_active' => true
        ]);

        $response = $this->actingAs($admin)
            ->delete("/admin/products/{$product->id}");

        $response->assertRedirect(route('admin.products.index'));
        
        // Pastikan product terhapus dari database
        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
    }

    public function test_non_admin_cannot_access_product_management()
    {
        $user = User::factory()->create(['role' => 'user']);
        
        $response = $this->actingAs($user)->get('/admin/products');
        $response->assertStatus(302);

        $response = $this->actingAs($user)->post('/admin/products', []);
        $response->assertStatus(302);

        // Gunakan ID dummy untuk test route yang membutuhkan ID
        $response = $this->actingAs($user)->put('/admin/products/999', []);
        $response->assertStatus(404);

        $response = $this->actingAs($user)->delete('/admin/products/999');
        $response->assertStatus(404);
    }
}