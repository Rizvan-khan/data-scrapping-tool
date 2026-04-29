<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_logs', function (Blueprint $table) {
          $table->id();
$table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
$table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('feature_key', 100);
            $table->decimal('credits_consumed', 12, 4)->default(0.0000);
            $table->enum('billing_source', ['subscription', 'free_credits', 'both'])
                  ->default('subscription');
            $table->string('request_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_logs');
    }
};