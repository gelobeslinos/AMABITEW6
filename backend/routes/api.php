<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\AnnouncementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    // Employees
    Route::apiResource('employees', EmployeeController::class);
    
    // Students
    Route::apiResource('students', StudentController::class);
    
    // Departments
    Route::apiResource('departments', DepartmentController::class);
    
    // Attendances
    Route::apiResource('attendances', AttendanceController::class);
    
    // Leave Requests
    Route::apiResource('leave-requests', LeaveRequestController::class);
    
    // Custom routes for leave requests
    Route::post('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve']);
    Route::post('leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject']);
    
    // Employee statistics
    Route::get('employees/{employee}/attendances', [EmployeeController::class, 'attendances']);
    Route::get('employees/{employee}/leave-requests', [EmployeeController::class, 'leaveRequests']);

    // Student Profiles
    Route::get('/student-profiles', [StudentProfileController::class, 'index']);
    Route::get('/student-profiles/{studentProfile}', [StudentProfileController::class, 'show']);
    Route::post('/student-profiles', [StudentProfileController::class, 'store']);
    Route::put('/student-profiles/{studentProfile}', [StudentProfileController::class, 'update']);
    Route::delete('/student-profiles/{studentProfile}', [StudentProfileController::class, 'destroy']);
    Route::post('/student-interests', [StudentProfileController::class, 'addInterest']);
    Route::delete('/student-interests/{studentInterest}', [StudentProfileController::class, 'removeInterest']);
    Route::get('/popular-interests', [StudentProfileController::class, 'getPopularInterests']);

    // Generate profiles for students without them
    Route::post('/student-profiles/generate-missing', [StudentProfileController::class, 'generateMissingProfiles']);

    // Announcements
    Route::apiResource('announcements', AnnouncementController::class);
    Route::get('/announcements/audience/{audience}', [AnnouncementController::class, 'getByAudience']);

    // Subjects
    Route::apiResource('subjects', SubjectController::class);
});
