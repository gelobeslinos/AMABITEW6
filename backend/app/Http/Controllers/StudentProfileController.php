<?php

namespace App\Http\Controllers;

use App\Http\Resources\StudentProfileResource;
use App\Models\StudentProfile;
use App\Models\StudentInterest;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentProfileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StudentProfile::with(['student', 'interests']);

        // Apply filters
        if ($request->has('interests')) {
            $query->withInterests($request->input('interests'));
        }

        if ($request->has('interest_category')) {
            $query->byInterestCategory($request->input('interest_category'));
        }

        if ($request->has('gpa_min') || $request->has('gpa_max')) {
            $query->byGpaRange(
                $request->input('gpa_min'),
                $request->input('gpa_max')
            );
        }

        if ($request->has('needs_intervention')) {
            $query->byInterventionNeeds($request->boolean('needs_intervention'));
        }

        if ($request->has('learning_style')) {
            $query->byLearningStyle($request->input('learning_style'));
        }

        if ($request->has('search')) {
            $query->byStudentSearch($request->input('search'));
        }

        $profiles = $query->paginate(10);

        return response()->json([
            'data' => StudentProfileResource::collection($profiles->items()),
            'meta' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'per_page' => $profiles->perPage(),
                'total' => $profiles->total(),
                'from' => $profiles->firstItem(),
                'to' => $profiles->lastItem(),
            ],
        ]);
    }

    public function show(StudentProfile $studentProfile): JsonResponse
    {
        return response()->json(new StudentProfileResource($studentProfile->load(['student', 'interests'])));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students',
            'learning_style' => 'nullable|string',
            'academic_strengths' => 'nullable|string',
            'academic_weaknesses' => 'nullable|string',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'career_aspiration' => 'nullable|string',
            'personal_goals' => 'nullable|string',
            'special_needs' => 'nullable|array',
            'counselor_notes' => 'nullable|string',
            'needs_intervention' => 'boolean',
            'intervention_notes' => 'nullable|string',
            'extracurricular_activities' => 'nullable|array',
            'leadership_experience' => 'nullable|string',
            'parent_contact_notes' => 'nullable|string',
        ]);

        $profile = StudentProfile::create($validated);

        return response()->json(new StudentProfileResource($profile), 201);
    }

    public function update(Request $request, StudentProfile $studentProfile): JsonResponse
    {
        $validated = $request->validate([
            'learning_style' => 'nullable|string',
            'academic_strengths' => 'nullable|string',
            'academic_weaknesses' => 'nullable|string',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'career_aspiration' => 'nullable|string',
            'personal_goals' => 'nullable|string',
            'special_needs' => 'nullable|array',
            'counselor_notes' => 'nullable|string',
            'needs_intervention' => 'boolean',
            'intervention_notes' => 'nullable|string',
            'extracurricular_activities' => 'nullable|array',
            'leadership_experience' => 'nullable|string',
            'parent_contact_notes' => 'nullable|string',
        ]);

        $studentProfile->update($validated);

        return response()->json(new StudentProfileResource($studentProfile->fresh()));
    }

    public function addInterest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students',
            'interest_category' => 'required|string',
            'interest_name' => 'required|string',
            'proficiency_level' => 'required|in:beginner,intermediate,advanced,expert',
            'description' => 'nullable|string',
            'is_primary_interest' => 'boolean',
            'years_of_experience' => 'integer|min:0',
            'achievements' => 'nullable|array',
        ]);

        $interest = StudentInterest::create($validated);

        return response()->json($interest, 201);
    }

    public function removeInterest(StudentInterest $studentInterest): JsonResponse
    {
        $studentInterest->delete();
        return response()->json(null, 204);
    }

    // Get popular interests for suggestions
    public function getPopularInterests(): JsonResponse
    {
        $interests = StudentInterest::getPopularInterests();
        return response()->json([
            'interests' => $interests,
            'proficiency_levels' => StudentInterest::getProficiencyLevels()
        ]);
    }

    // Generate profiles for students without them
    public function generateMissingProfiles()
    {
        $studentsWithoutProfiles = Student::whereNotIn('id', function($query) {
            $query->select('student_id')->from('student_profiles');
        })->get();

        $generatedProfiles = [];
        
        foreach ($studentsWithoutProfiles as $student) {
            // Generate basic profile
            $profile = StudentProfile::create([
                'student_id' => $student->id,
                'learning_style' => collect(['visual', 'auditory', 'kinesthetic', 'reading_writing'])->random(),
                'academic_strengths' => 'To be determined',
                'academic_weaknesses' => 'To be determined',
                'gpa' => round(mt_rand(250, 400) / 100, 2), // Random GPA between 2.50 and 4.00
                'career_aspiration' => 'To be determined',
                'personal_goals' => 'To be determined',
                'special_needs' => null,
                'counselor_notes' => 'Initial profile created',
                'needs_intervention' => false,
                'intervention_notes' => null,
                'extracurricular_activities' => [],
                'leadership_experience' => 'None specified',
                'parent_contact_notes' => 'Initial profile created'
            ]);

            // Add some random interests
            $popularInterests = StudentInterest::getPopularInterests();
            $selectedInterests = [];
            
            // Select 2-4 random interests from different categories
            $categories = array_keys($popularInterests);
            $selectedCategories = collect($categories)->random(mt_rand(2, 4));
            
            foreach ($selectedCategories as $category) {
                $interestsInCategory = $popularInterests[$category];
                $selectedInterest = collect($interestsInCategory)->random();
                
                StudentInterest::create([
                    'student_id' => $student->id,
                    'interest_category' => $category,
                    'interest_name' => $selectedInterest,
                    'proficiency_level' => collect(['beginner', 'intermediate', 'advanced', 'expert'])->random(),
                    'description' => "Interest in {$selectedInterest}",
                    'is_primary_interest' => mt_rand(0, 1) == 1,
                    'years_of_experience' => mt_rand(0, 5),
                    'achievements' => []
                ]);
                
                $selectedInterests[] = $selectedInterest;
            }

            $generatedProfiles[] = [
                'student_id' => $student->student_id,
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'profile_id' => $profile->id,
                'interests_added' => count($selectedInterests)
            ];
        }

        return response()->json([
            'message' => 'Profiles generated successfully',
            'profiles_generated' => count($generatedProfiles),
            'profiles' => $generatedProfiles
        ]);
    }
}
