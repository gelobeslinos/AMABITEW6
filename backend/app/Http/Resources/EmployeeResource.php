<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\LeaveRequestResource;

class EmployeeResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'position' => $this->position,
            'salary' => $this->salary,
            'hire_date' => $this->hire_date,
            'status' => $this->status,
            'attendances' => AttendanceResource::collection($this->whenLoaded('attendances')),
            'leave_requests' => LeaveRequestResource::collection($this->whenLoaded('leaveRequests')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
