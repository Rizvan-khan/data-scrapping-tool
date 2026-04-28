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
           if (!Schema::hasColumn('scrape_results', 'email')) {
                $table->string('email')->nullable()->after('name');
            }
            if (!Schema::hasColumn('scrape_results', 'website')) {
                $table->string('website')->nullable()->after('email');
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
            if (!Schema::hasColumn('scrape_results', 'working_hours')) {
                $table->text('working_hours')->nullable()->after('review_count');
            }
            if (!Schema::hasColumn('scrape_results', 'instagram')) {
                $table->string('instagram')->nullable()->after('working_hours');
            }
            if (!Schema::hasColumn('scrape_results', 'facebook')) {
                $table->string('facebook')->nullable()->after('instagram');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scrape_results', function (Blueprint $table) {
           $table->dropColumn([
                'email', 'website', 'city', 'country', 
                'review_count', 'working_hours', 'instagram', 'facebook'
            ]);
        });
    }
};
