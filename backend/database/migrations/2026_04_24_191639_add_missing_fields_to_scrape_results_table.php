<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scrape_results', function (Blueprint $table) {
            if (!Schema::hasColumn('scrape_results', 'category')) {
            $table->string('category')->nullable()->after('name');
        }
        if (!Schema::hasColumn('scrape_results', 'email')) {
            $table->string('email')->nullable()->after('category');
        }
        if (!Schema::hasColumn('scrape_results', 'city')) {
            $table->string('city')->nullable()->after('address');
        }
        if (!Schema::hasColumn('scrape_results', 'country')) {
            $table->string('country')->nullable()->after('city');
        }
        if (!Schema::hasColumn('scrape_results', 'review_count')) {
            $table->integer('review_count')->default(0)->after('rating');
        }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scrape_results', function (Blueprint $table) {
            //
        });
    }
};
