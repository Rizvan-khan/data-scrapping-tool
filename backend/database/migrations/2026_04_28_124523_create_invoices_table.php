<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('invoice_number', 50)->unique();
            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('tax_percent', 5, 2)->default(18.00);
            $table->decimal('tax_amount', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->string('currency', 10)->default('INR');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded', 'void'])
                  ->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};