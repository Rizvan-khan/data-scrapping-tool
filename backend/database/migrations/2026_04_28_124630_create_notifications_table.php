<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
            $table->enum('type', [
                'subscription_activated',
                'subscription_expired',
                'subscription_cancelled',
                'payment_failed',
                'payment_success',
                'trial_ending',
                'credits_low',
                'credits_expired',
                'invoice_generated',
                'promo_applied',
            ]);
            $table->string('title');
            $table->text('body')->nullable();
            $table->boolean('is_read')->default(false);
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 50)->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};