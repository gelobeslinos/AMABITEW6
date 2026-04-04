<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function index()
    {
        $attendances = Attendance::with('employee')->get();
        return AttendanceResource::collection($attendances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'status' => ['required', Rule::in(['present', 'absent', 'late', 'half_day'])],
            'notes' => 'nullable|string',
        ]);

        $attendance = Attendance::create($validated);
        return new AttendanceResource($attendance->load('employee'));
    }

    public function show(Attendance $attendance)
    {
        return new AttendanceResource($attendance->load('employee'));
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'employee_id' => 'sometimes|exists:employees,id',
            'date' => 'sometimes|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'status' => ['sometimes', Rule::in(['present', 'absent', 'late', 'half_day'])],
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);
        return new AttendanceResource($attendance->load('employee'));
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
