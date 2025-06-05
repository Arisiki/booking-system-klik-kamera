<?php

namespace Tests\Feature\ProductManagementUser;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSeeDetailProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_product_detail()
    {
        $product = Product::factory()->create();

        $response = $this->get("/products/{$product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/DetailProduct')
            ->has('product', fn ($assert) => $assert
                ->where('id', $product->id)
                ->where('name', $product->name)
                ->where('description', $product->description)
                ->where('category', $product->category)
                ->where('price_per_day', $product->price_per_day)
                ->where('stock', $product->stock)
                ->etc()
            )
        );
    }

    public function test_guest_can_view_product_detail()
    {
        $product = Product::factory()->create();

        $response = $this->get("/products/{$product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/DetailProduct')
            ->has('product')
        );
    }

    public function test_error_404_when_product_not_found()
    {
        $response = $this->get('/products/999');

        $response->assertStatus(404);
    }

    public function test_product_detail_shows_related_products()
    {
        $mainProduct = Product::factory()->create(['category' => 'camera']);
        $relatedProducts = Product::factory()->count(3)->create(['category' => 'camera']);

        $response = $this->get("/products/{$mainProduct->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/DetailProduct')
            ->has('relatedProducts', 3)
        );
    }

    public function test_product_detail_shows_reviews()
    {
        $product = Product::factory()
            ->hasReviews(3)
            ->create();

        $response = $this->get("/products/{$product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/DetailProduct')
            ->has('product.reviews', 3)
        );
    }
}
