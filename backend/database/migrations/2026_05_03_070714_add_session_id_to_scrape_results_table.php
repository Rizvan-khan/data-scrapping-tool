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
        $table->foreignId('scrape_session_id')
              ->nullable()
              ->after('user_id')
              ->constrained('scrape_sessions')
              ->cascadeOnDelete();
    });
}

public function down(): void
{
    Schema::table('scrape_results', function (Blueprint $table) {
        $table->dropForeign(['scrape_session_id']);
        $table->dropColumn('scrape_session_id');
    });
}
};
