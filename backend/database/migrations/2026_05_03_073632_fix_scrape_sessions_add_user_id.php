<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scrape_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('scrape_sessions', 'user_id')) {
                $table->foreignId('user_id')
                      ->after('id')
                      ->constrained()
                      ->cascadeOnDelete();
            }
            if (!Schema::hasColumn('scrape_sessions', 'keyword')) {
                $table->string('keyword')->after('user_id');
            }
            if (!Schema::hasColumn('scrape_sessions', 'location')) {
                $table->string('location')->after('keyword');
            }
            if (!Schema::hasColumn('scrape_sessions', 'requested_limit')) {
                $table->integer('requested_limit')->default(10)->after('location');
            }
            if (!Schema::hasColumn('scrape_sessions', 'result_count')) {
                $table->integer('result_count')->default(0)->after('requested_limit');
            }
            if (!Schema::hasColumn('scrape_sessions', 'status')) {
                $table->enum('status', ['pending', 'processing', 'completed', 'failed'])
                      ->default('pending')->after('result_count');
            }
            if (!Schema::hasColumn('scrape_sessions', 'error_message')) {
                $table->text('error_message')->nullable()->after('status');
            }
            if (!Schema::hasColumn('scrape_sessions', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('error_message');
            }
        });
    }

    public function down(): void
    {
        Schema::table('scrape_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'user_id', 'keyword', 'location', 'requested_limit',
                'result_count', 'status', 'error_message', 'completed_at'
            ]);
        });
    }
};