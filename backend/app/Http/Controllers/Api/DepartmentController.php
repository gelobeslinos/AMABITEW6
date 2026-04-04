<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DepartmentController extends Controller
{
    public function index()
    {
        // The current `employees` migration does not include `department_id`,
        // so eager-loading the `employees` relationship would fail.
        $departments = Department::all();
        return DepartmentResource::collection($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $department = Department::create($validated);
        return new DepartmentResource($department);
    }

    public function show(Department $department)
    {
        return new DepartmentResource($department);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $department->update($validated);
        return new DepartmentResource($department);
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
