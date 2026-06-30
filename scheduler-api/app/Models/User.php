<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Availability;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected static function booted()
    {
        static::created(function ($user) {
            if ($user->role === 'attendant') {
                foreach (range(1, 5) as $day) {
                    Availability::create([
                        'user_id'    => $user->id,
                        'day_of_week' => $day,
                        'start_time'  => '08:00',
                        'end_time'    => '18:00',
                        'is_active'   => true
                    ]);
                }
            }
        });
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }
}