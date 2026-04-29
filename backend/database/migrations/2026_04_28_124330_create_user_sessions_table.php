<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {
          $table->id();
        $table->foreignId('user_id')->index()->constrained()->onDelete('cascade'); // ✅ fix
        $table->string('token_hash')->unique();
        $table->string('device_info')->nullable();
        $table->ipAddress('ip_address')->nullable();
        $table->text('user_agent')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamp('expires_at');
        $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};