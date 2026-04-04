<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'manager_name' => $this->manager_name,
            'location' => $this->location,
            'budget' => $this->budget,
            // The current DB schema does not link employees to departments.
            // Keep the fields stable without triggering relationship queries.
            'employee_count' => 0,
            'employees' => [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
