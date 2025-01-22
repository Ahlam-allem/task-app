<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'completed',
        'external_id'
    ];

    protected $casts = [
        'completed' => 'boolean'
    ];
}