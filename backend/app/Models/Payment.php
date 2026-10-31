<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $guarded = [];
    protected $hidden = ['verified_by', 'verification_reference'];
    public function order() { return $this->belongsTo(Order::class); }
}
