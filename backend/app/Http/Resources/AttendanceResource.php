<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\EmployeeResource;

class AttendanceResource extends JsonResource
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
            'date' => $this->date,
            'check_in' => $this->check_in,
            'check_out' => $this->check_out,
            'status' => $this->status,
            'notes' => $this->notes,
            'work_hours' => $this->work_hours,
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
