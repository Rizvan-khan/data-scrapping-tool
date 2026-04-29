<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
        $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
        $table->string('company_name', 150)->nullable();
        $table->string('country', 100)->nullable();
        $table->string('timezone', 60)->default('Asia/Kolkata');
        $table->string('currency', 10)->default('INR');
        $table->string('language', 10)->default('en');
        $table->string('address_line1')->nullable();
        $table->string('address_line2')->nullable();
        $table->string('city', 100)->nullable();
        $table->string('state', 100)->nullable();
        $table->string('postal_code', 20)->nullable();
        $table->string('gstin', 20)->nullable();
        $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};