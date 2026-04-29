<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_allocations', function (Blueprint $table) {
           $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('credit_id')->index()->constrained('free_credits')->onDelete('cascade');
            $table->enum('source', [
                'signup_bonus',
                'referral',
                'promo_code',
                'admin_grant',
                'subscription_bonus',
                'compensation',
            ]);
            $table->decimal('amount', 12, 4);
            $table->text('notes')->nullable();
            $table->string('promo_code', 50)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_allocations');
    }
};