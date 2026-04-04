<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class LeaveRequestController extends Controller
{
    public function index()
    {
        $leaveRequests = LeaveRequest::with(['employee', 'approvedBy'])->get();
        return LeaveRequestResource::collection($leaveRequests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => ['required', Rule::in(['sick', 'vacation', 'personal', 'maternity', 'paternity'])],
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $validated['days'] = $request->start_date->diffInDays($request->end_date) + 1;
        $validated['status'] = 'pending';

        $leaveRequest = LeaveRequest::create($validated);
        return new LeaveRequestResource($leaveRequest->load(['employee', 'approvedBy']));
    }

    public function show(LeaveRequest $leaveRequest)
    {
        return new LeaveRequestResource($leaveRequest->load(['employee', 'approvedBy']));
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'type' => ['sometimes', Rule::in(['sick', 'vacation', 'personal', 'maternity', 'paternity'])],
            'start_date' => 'sometimes|date|after_or_equal:today',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'reason' => 'sometimes|string',
        ]);

        if (isset($validated['start_date']) && isset($validated['end_date'])) {
            $validated['days'] = $request->start_date->diffInDays($request->end_date) + 1;
        }

        $leaveRequest->update($validated);
        return new LeaveRequestResource($leaveRequest->load(['employee', 'approvedBy']));
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $leaveRequest->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'manager_id' => 'required|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        $manager = Employee::findOrFail($validated['manager_id']);
        $leaveRequest->approve($manager, $validated['notes']);

        return new LeaveRequestResource($leaveRequest->load(['employee', 'approvedBy']));
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $validated = $request->validate([
            'manager_id' => 'required|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        $manager = Employee::findOrFail($validated['manager_id']);
        $leaveRequest->reject($manager, $validated['notes']);

        return new LeaveRequestResource($leaveRequest->load(['employee', 'approvedBy']));
    }
}
