<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentInterest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'interest_category',
        'interest_name',
        'proficiency_level',
        'description',
        'is_primary_interest',
        'years_of_experience',
        'achievements',
    ];

    protected $casts = [
        'achievements' => 'array',
        'is_primary_interest' => 'boolean',
        'years_of_experience' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Popular interest categories and names for suggestions
    public static function getPopularInterests()
    {
        return [
            'sports' => ['basketball', 'football', 'volleyball', 'swimming', 'tennis', 'soccer', 'badminton'],
            'technology' => ['programming', 'web development', 'mobile development', 'data science', 'cybersecurity', 'ai/ml'],
            'games' => ['mobile_games', 'pc_games', 'console_games', 'game_development', 'esports'],
            'arts' => ['painting', 'music', 'photography', 'theater', 'dance', 'creative_writing'],
            'academics' => ['mathematics', 'science', 'literature', 'history', 'languages', 'research'],
            'leadership' => ['student_government', 'club_leadership', 'team_captain', 'volunteer_coordination'],
            'indoor' => ['reading', 'board_games', 'puzzles', 'cooking', 'baking', 'crafts', 'yoga', 'meditation'],
            'outdoor' => ['hiking', 'camping', 'fishing', 'gardening', 'cycling', 'running', 'photography', 'bird_watching'],
        ];
    }

    public static function getProficiencyLevels()
    {
        return ['beginner', 'intermediate', 'advanced', 'expert'];
    }
}
