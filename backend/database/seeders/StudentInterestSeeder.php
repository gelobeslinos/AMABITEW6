<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\StudentInterest;
use Illuminate\Support\Facades\DB;

class StudentInterestSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::all();
        
        $interests = [
            // Sports interests
            ['interest_category' => 'sports', 'interest_name' => 'basketball', 'students' => [1901850, 1901851]],
            ['interest_category' => 'sports', 'interest_name' => 'volleyball', 'students' => [1901852, 1901853]],
            ['interest_category' => 'sports', 'interest_name' => 'swimming', 'students' => [1901854, 1901850]],
            
            // Technology interests
            ['interest_category' => 'technology', 'interest_name' => 'programming', 'students' => [1901850, 1901853, 1901857]],
            ['interest_category' => 'technology', 'interest_name' => 'web development', 'students' => [1901851, 1901854]],
            ['interest_category' => 'technology', 'interest_name' => 'mobile development', 'students' => [1901852, 1901856]],
            
            // Games interests
            ['interest_category' => 'games', 'interest_name' => 'mobile_games', 'students' => [1901850, 1901856, 1901857]],
            ['interest_category' => 'games', 'interest_name' => 'pc_games', 'students' => [1901851, 1901853]],
            ['interest_category' => 'games', 'interest_name' => 'esports', 'students' => [1901854, 1901850]],
            
            // Arts interests
            ['interest_category' => 'arts', 'interest_name' => 'painting', 'students' => [1901853, 1901855]],
            ['interest_category' => 'arts', 'interest_name' => 'music', 'students' => [1901854, 1901856]],
            ['interest_category' => 'arts', 'interest_name' => 'photography', 'students' => [1901857, 1901850]],
            
            // Academic interests
            ['interest_category' => 'academics', 'interest_name' => 'mathematics', 'students' => [1901850, 1901854]],
            ['interest_category' => 'academics', 'interest_name' => 'science', 'students' => [1901851, 1901855]],
            ['interest_category' => 'academics', 'interest_name' => 'literature', 'students' => [1901852, 1901856]],
            
            // Indoor interests
            ['interest_category' => 'indoor', 'interest_name' => 'reading', 'students' => [1901850, 1901853]],
            ['interest_category' => 'indoor', 'interest_name' => 'board_games', 'students' => [1901851, 1901854]],
            ['interest_category' => 'indoor', 'interest_name' => 'cooking', 'students' => [1901852, 1901855]],
            ['interest_category' => 'indoor', 'interest_name' => 'yoga', 'students' => [1901856, 1901857]],
            
            // Outdoor interests
            ['interest_category' => 'outdoor', 'interest_name' => 'hiking', 'students' => [1901850, 1901854]],
            ['interest_category' => 'outdoor', 'interest_name' => 'camping', 'students' => [1901851, 1901855]],
            ['interest_category' => 'outdoor', 'interest_name' => 'cycling', 'students' => [1901852, 1901856]],
            ['interest_category' => 'outdoor', 'interest_name' => 'gardening', 'students' => [1901853, 1901857]],
        ];

        foreach ($interests as $interest) {
            foreach ($interest['students'] as $studentId) {
                // `studentId` values in this seeder are the *student_id* column values,
                // not the auto-incremented primary key (`id`).
                $student = $students->where('student_id', (string) $studentId)->first();
                if ($student) {
                    StudentInterest::create([
                        'student_id' => $student->id,
                        'interest_category' => $interest['interest_category'],
                        'interest_name' => $interest['interest_name'],
                        'proficiency_level' => collect(['beginner', 'intermediate', 'advanced', 'expert'])->random(),
                        'description' => "Interest in {$interest['interest_name']}",
                        'is_primary_interest' => mt_rand(0, 1) == 1,
                        'years_of_experience' => mt_rand(0, 5),
                        'achievements' => []
                    ]);
                }
            }
        }
    }
}
