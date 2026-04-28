<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scrape_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 🔥 important
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('rating')->nullable();
            $table->string('search_keyword')->nullable();
            $table->string('search_location')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scrape_results');
    }
};
