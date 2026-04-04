<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'student_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'year_level',
        'program',
        'status',
        'date_enrolled',
    ];

    protected $casts = [
        'date_enrolled' => 'date',
        'year_level' => 'integer',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
