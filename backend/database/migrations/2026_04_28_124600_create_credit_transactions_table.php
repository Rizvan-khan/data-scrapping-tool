<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
           $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('credit_id')->index()->constrained('free_credits')->onDelete('cascade');
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 12, 4);
            $table->decimal('balance_before', 12, 4);
            $table->decimal('balance_after', 12, 4);
            $table->enum('source', [
                'signup_bonus',
                'referral',
                'promo_code',
                'admin_grant',
                'api_usage',
                'feature_usage',
                'refund',
                'expiry_deduction',
                'subscription_bonus',
            ]);
            $table->string('reference_id')->nullable();
            $table->string('feature_key', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

          
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};