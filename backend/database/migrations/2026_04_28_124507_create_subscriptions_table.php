<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
           $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('plan_id')->index()->constrained()->onDelete('restrict');
            $table->enum('status', [
                'trialing',
                'active',
                'past_due',
                'cancelled',
                'expired',
                'paused',
            ])->default('active');
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->string('payment_gateway', 50)->nullable();
            $table->string('gateway_subscription_id')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamps();
            $table->softDeletes();

            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};