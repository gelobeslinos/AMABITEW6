<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::query()->orderBy('id', 'desc')->get();
        return SubjectResource::collection($subjects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject = Subject::create($validated);

        return new SubjectResource($subject);
    }

    public function show(Subject $subject)
    {
        return new SubjectResource($subject);
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject->update($validated);

        return new SubjectResource($subject);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}

