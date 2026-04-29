<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
          $table->id();
$table->foreignId('promo_code_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percent', 'flat', 'free_credits']);
            $table->decimal('discount_value', 10, 2);
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->decimal('min_order_amount', 10, 2)->default(0.00);
            $table->json('applicable_plans')->nullable(); // array of plan slugs
            $table->timestamp('valid_from')->useCurrent();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};