<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_credits', function (Blueprint $table) {
           $table->id();
$table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->decimal('total_credits', 12, 4)->default(0.0000);
            $table->decimal('used_credits', 12, 4)->default(0.0000);
            $table->decimal('reserved_credits', 12, 4)->default(0.0000);
            // remaining_credits = total - used - reserved (computed in app layer)
            $table->decimal('lifetime_earned', 12, 4)->default(0.0000);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_reset_at')->nullable();
            $table->timestamps();

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('free_credits');
    }
};