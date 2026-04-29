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
        Schema::table('users', function (Blueprint $table) {

 $table->string('phone', 20)
                  ->nullable()
                  ->after('email');

             $table->string('avatar_url')
                  ->nullable()
                  ->after('phone');
 
            // ------------------------------------------------
            // ACCOUNT STATUS & ROLE
            // ------------------------------------------------
            $table->enum('status', ['active', 'suspended', 'deleted'])
                  ->default('active')
                  ->after('avatar_url')
                  ->comment('active = normal user | suspended = blocked | deleted = soft deleted');

              $table->enum('role', ['user', 'admin', 'superadmin'])
                  ->default('user')
                  ->after('status')
                  ->comment('user = normal | admin = panel access | superadmin = full access');
 
                    $table->timestamp('last_login_at')
                  ->nullable()
                  ->after('remember_token')
                  ->comment('Last successful login time');
 
            $table->ipAddress('last_login_ip')
                  ->nullable()
                  ->after('last_login_at')
                  ->comment('IP address of last login');

                   $table->softDeletes(); // adds deleted_at column
 
          


        });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
             $table->dropIndex(['status']);
            $table->dropIndex(['role']);
            $table->dropIndex(['last_login_at']);
 
            // Columns drop karo
            $table->dropColumn([
               'phone',
                'avatar_url',
                'status',
                'role',
                'last_login_at',
                'last_login_ip',
                'deleted_at',
            ]);
        });
    }
};
