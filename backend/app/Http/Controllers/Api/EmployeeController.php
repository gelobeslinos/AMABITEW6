<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\LeaveRequestResource;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::all();
        return EmployeeResource::collection($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees',
            'phone' => 'required|string|max:20',
            'position' => 'required|string|max:255',
            'salary' => 'required|numeric|min:0',
            'hire_date' => 'required|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'terminated'])],
        ]);

        $employee = Employee::create($validated);
        return new EmployeeResource($employee);
    }

    public function show(Employee $employee)
    {
        return new EmployeeResource($employee->load(['attendances', 'leaveRequests']));
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('employees')->ignore($employee->id)],
            'phone' => 'sometimes|string|max:20',
            'position' => 'sometimes|string|max:255',
            'salary' => 'sometimes|numeric|min:0',
            'hire_date' => 'sometimes|date',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'terminated'])],
        ]);

        $employee->update($validated);
        return new EmployeeResource($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function attendances(Employee $employee)
    {
        $attendances = $employee->attendances()->get();
        return AttendanceResource::collection($attendances);
    }

    public function leaveRequests(Employee $employee)
    {
        $leaveRequests = $employee->leaveRequests()->with('approvedBy')->get();
        return LeaveRequestResource::collection($leaveRequests);
    }
}
