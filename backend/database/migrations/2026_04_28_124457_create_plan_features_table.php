<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_features', function (Blueprint $table) {
          $table->id();
$table->foreignId('plan_id')->index()->constrained()->onDelete('cascade');
            $table->string('feature_key', 100);
            $table->string('feature_value', 255);
            $table->enum('value_type', ['string', 'integer', 'boolean', 'decimal'])
                  ->default('string');
            $table->string('display_label')->nullable();
            $table->timestamp('created_at')->useCurrent();


        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_features');
    }
};