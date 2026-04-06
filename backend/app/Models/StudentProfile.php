<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'learning_style',
        'academic_strengths',
        'academic_weaknesses',
        'academic_history',
        'non_academic_activities',
        'violations',
        'gpa',
        'career_aspiration',
        'personal_goals',
        'special_needs',
        'counselor_notes',
        'needs_intervention',
        'intervention_notes',
        'extracurricular_activities',
        'affiliations',
        'skills',
        'leadership_experience',
        'parent_contact_notes',
    ];

    protected $casts = [
        'special_needs' => 'array',
        'extracurricular_activities' => 'array',
        'affiliations' => 'array',
        'skills' => 'array',
        'achievements' => 'array',
        'gpa' => 'decimal:2',
        'needs_intervention' => 'boolean',
        'is_primary_interest' => 'boolean',
        'years_of_experience' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function interests(): HasMany
    {
        return $this->hasMany(StudentInterest::class, 'student_id', 'student_id');
    }

    // Scope for filtering by interests
    public function scopeWithInterests($query, $interests)
    {
        if (empty($interests)) {
            return $query;
        }

        $interestArray = is_array($interests) ? $interests : explode(',', $interests);
        $interestArray = array_map('trim', $interestArray);

        return $query->whereHas('interests', function ($query) use ($interestArray) {
            $query->whereIn('interest_name', $interestArray);
        });
    }

    // Scope for filtering by interest category
    public function scopeByInterestCategory($query, $category)
    {
        if (empty($category)) {
            return $query;
        }

        return $query->whereHas('interests', function ($query) use ($category) {
            $query->where('interest_category', $category);
        });
    }

    // Scope for filtering by GPA range
    public function scopeByGpaRange($query, $min, $max)
    {
        if ($min !== null) {
            $query->where('gpa', '>=', $min);
        }
        if ($max !== null) {
            $query->where('gpa', '<=', $max);
        }
        return $query;
    }

    // Scope for filtering by intervention needs
    public function scopeByInterventionNeeds($query, $needsIntervention)
    {
        if ($needsIntervention === null) {
            return $query;
        }

        return $query->where('needs_intervention', $needsIntervention);
    }

    // Scope for filtering by learning style
    public function scopeByLearningStyle($query, $learningStyle)
    {
        if (empty($learningStyle)) {
            return $query;
        }

        return $query->where('learning_style', $learningStyle);
    }

    public function scopeBySkill($query, $skills)
    {
        if (empty($skills)) {
            return $query;
        }

        // Handle multiple skills (comma-separated or array)
        $skillArray = is_array($skills) ? $skills : explode(',', $skills);
        $skillArray = array_map('trim', $skillArray);
        $skillArray = array_filter($skillArray);

        if (empty($skillArray)) {
            return $query;
        }

        // Use whereJsonContains for each skill with OR condition
        $query->where(function ($subQuery) use ($skillArray) {
            foreach ($skillArray as $skill) {
                $subQuery->orWhereJsonContains('skills', $skill);
            }
        });

        return $query;
    }

    public function scopeByActivity($query, $activities)
    {
        if (empty($activities)) {
            return $query;
        }

        // Handle multiple activities (comma-separated or array)
        $activityArray = is_array($activities) ? $activities : explode(',', $activities);
        $activityArray = array_map('trim', $activityArray);
        $activityArray = array_filter($activityArray);

        if (empty($activityArray)) {
            return $query;
        }

        // Use OR condition for multiple activities
        $query->where(function ($subQuery) use ($activityArray) {
            foreach ($activityArray as $activity) {
                $subQuery->orWhere('non_academic_activities', 'like', "%{$activity}%");
            }
        });

        return $query;
    }

    public function scopeByAffiliation($query, $affiliations)
    {
        if (empty($affiliations)) {
            return $query;
        }

        // Handle multiple affiliations (comma-separated or array)
        $affiliationArray = is_array($affiliations) ? $affiliations : explode(',', $affiliations);
        $affiliationArray = array_map('trim', $affiliationArray);
        $affiliationArray = array_filter($affiliationArray);

        if (empty($affiliationArray)) {
            return $query;
        }

        // Use whereJsonContains for each affiliation with OR condition
        $query->where(function ($subQuery) use ($affiliationArray) {
            foreach ($affiliationArray as $affiliation) {
                $subQuery->orWhereJsonContains('affiliations', $affiliation);
            }
        });

        return $query;
    }

    // Scope for searching by student name or ID
    public function scopeByStudentSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->whereHas('student', function ($query) use ($search) {
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('student_id', 'like', "%{$search}%");
            });
        });
    }
}
