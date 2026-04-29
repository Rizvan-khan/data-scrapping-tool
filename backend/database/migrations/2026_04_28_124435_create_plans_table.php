<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->enum('billing_cycle', ['monthly', 'yearly', 'lifetime']);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('currency', 10)->default('INR');
            $table->integer('trial_days')->default(0);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
            $table->index('billing_cycle');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};