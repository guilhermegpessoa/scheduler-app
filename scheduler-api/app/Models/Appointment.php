<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = ['user_id', 'appointment_date', 'start_time', 'end_time', 'client_name', 'client_email'];
}