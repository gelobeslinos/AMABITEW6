<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\EmployeeResource;

class LeaveRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'type' => $this->type,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'days' => $this->days,
            'reason' => $this->reason,
            'status' => $this->status,
            'manager_notes' => $this->manager_notes,
            'approved_by' => $this->approved_by,
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'approvedBy' => EmployeeResource::make($this->whenLoaded('approvedBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
