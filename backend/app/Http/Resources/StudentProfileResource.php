<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'student' => [
                'id' => $this->student->id,
                'student_id' => $this->student->student_id,
                'first_name' => $this->student->first_name,
                'last_name' => $this->student->last_name,
                'full_name' => $this->student->first_name . ' ' . $this->student->last_name,
                'email' => $this->student->email,
                'phone' => $this->student->phone,
                'program' => $this->student->program,
                'year_level' => $this->student->year_level,
            ],
            'academic_profile' => [
                'learning_style' => $this->learning_style,
                'academic_strengths' => $this->academic_strengths,
                'academic_weaknesses' => $this->academic_weaknesses,
                'academic_history' => $this->academic_history,
                'gpa' => $this->gpa,
                'career_aspiration' => $this->career_aspiration,
                'personal_goals' => $this->personal_goals,
            ],
            'support_needs' => [
                'special_needs' => $this->special_needs,
                'counselor_notes' => $this->counselor_notes,
                'needs_intervention' => $this->needs_intervention,
                'intervention_notes' => $this->intervention_notes,
            ],
            'activities' => [
                'non_academic_activities' => $this->non_academic_activities,
                'extracurricular_activities' => $this->extracurricular_activities,
                'affiliations' => $this->affiliations,
                'skills' => $this->skills,
                'violations' => $this->violations,
                'leadership_experience' => $this->leadership_experience,
                'parent_contact_notes' => $this->parent_contact_notes,
            ],
            'interests' => $this->interests->map(function ($interest) {
                return [
                    'id' => $interest->id,
                    'interest_category' => $interest->interest_category,
                    'interest_name' => $interest->interest_name,
                    'proficiency_level' => $interest->proficiency_level,
                    'description' => $interest->description,
                    'is_primary_interest' => $interest->is_primary_interest,
                    'years_of_experience' => $interest->years_of_experience,
                    'achievements' => $interest->achievements,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
