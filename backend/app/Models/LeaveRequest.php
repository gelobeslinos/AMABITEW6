<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'type',
        'start_date',
        'end_date',
        'days',
        'reason',
        'status',
        'manager_notes',
        'approved_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'approved_by');
    }

    public function approve(Employee $manager, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $manager->id,
            'manager_notes' => $notes,
        ]);
    }

    public function reject(Employee $manager, ?string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $manager->id,
            'manager_notes' => $notes,
        ]);
    }
}
