<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'student_id' => $this->student_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'year_level' => $this->year_level,
            'program' => $this->program,
            'status' => $this->status,
            'date_enrolled' => $this->date_enrolled,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
