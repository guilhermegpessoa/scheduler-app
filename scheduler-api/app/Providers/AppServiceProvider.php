<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // RQF 1.1 e 1.2 - Defines the global system administrator
        Gate::define('manage-users', function (User $user) {
            return $user->role === 'administrator';
        });

        // RQF 1.3 - Define the editing rule: Admin edits everything; attendant edits only their own entries.
        Gate::define('update-user', function (User $user, User $targetUser) {
            return $user->role === 'administrator' || $user->id === $targetUser->id;
        });
    }
}