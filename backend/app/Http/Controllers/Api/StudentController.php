<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::all();
        return StudentResource::collection($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|string|max:50|unique:students',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students',
            'phone' => 'required|string|max:20',
            'year_level' => 'required|integer|min:1|max:4',
            'program' => 'required|string|max:255',
            'date_enrolled' => 'required|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'graduated'])],
        ]);

        $student = Student::create($validated);
        return new StudentResource($student);
    }

    public function show(Student $student)
    {
        return new StudentResource($student);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'student_id' => ['sometimes', 'string', 'max:50', Rule::unique('students')->ignore($student->id)],
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('students')->ignore($student->id)],
            'phone' => 'sometimes|string|max:20',
            'year_level' => 'sometimes|integer|min:1|max:4',
            'program' => 'sometimes|string|max:255',
            'date_enrolled' => 'sometimes|date',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'graduated'])],
        ]);

        $student->update($validated);
        return new StudentResource($student);
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
