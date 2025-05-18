<?php

namespace Tests\Feature\Auth;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSeeAllProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_products_list()
    {
        $response = $this->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/AllProducts')
        );
    }

    public function test_user_can_view_products_list()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/AllProducts')
        );
    }

    public function test_products_are_displayed_in_list()
    {
        $products = Product::factory()->count(3)->create();

        $response = $this->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/AllProducts')
            ->has('products', 3)
            ->where('products.0.id', $products[0]->id)
            ->where('products.0.name', $products[0]->name)
        );
    }

    public function test_products_can_be_filtered_by_category()
    {
        $category = 'camera';
        $products = Product::factory()->count(3)->create(['category' => $category]);
        Product::factory()->count(2)->create(['category' => 'lens']);

        $response = $this->get("/products?category={$category}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/AllProducts')
            ->has('products', 3)
        );
    }

    public function test_products_can_be_searched_by_name()
    {
        $searchTerm = 'Canon';
        $products = Product::factory()->create(['name' => 'Canon EOS R5']);
        Product::factory()->create(['name' => 'Nikon D850']);

        $response = $this->get("/products?search={$searchTerm}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Products/AllProducts')
            ->has('products', 1)
            ->where('products.0.name', $products->name)
        );
    }
}
