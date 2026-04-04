<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

class StudentProfileSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::all();
        
        foreach ($students as $student) {
            StudentProfile::create([
                'student_id' => $student->id,
                'learning_style' => collect(['visual', 'auditory', 'kinesthetic', 'reading_writing'])->random(),
                'academic_strengths' => collect(['Critical thinking', 'Problem solving', 'Creativity', 'Leadership', 'Communication', 'Analytical skills'])->random(3)->implode(', '),
                'academic_weaknesses' => collect(['Time management', 'Public speaking', 'Math anxiety', 'Test anxiety', 'Perfectionism', 'Procrastination'])->random(2)->implode(', '),
                'gpa' => round(mt_rand(250, 400) / 100, 2), // Random GPA between 2.50 and 4.00
                'career_aspiration' => collect(['Software Engineer', 'Data Scientist', 'IT Manager', 'Web Developer', 'Systems Analyst', 'Project Manager', 'Cybersecurity Specialist', 'AI/ML Engineer'])->random(),
                'personal_goals' => collect(['Graduate with honors', 'Start own business', 'Work in tech industry', 'Pursue master\'s degree', 'Get internship at top tech company', 'Build professional network'])->random(3)->implode(', '),
                'special_needs' => null,
                'counselor_notes' => 'Initial profile created during system setup',
                'needs_intervention' => mt_rand(0, 10) > 8, // 20% chance of needing intervention
                'intervention_notes' => mt_rand(0, 10) > 8 ? 'Requires additional academic support' : null,
                'extracurricular_activities' => collect(['Student Council', 'Tech Club', 'Debate Team', 'Sports Team', 'Volunteer Work', 'Research Assistant'])->random(mt_rand(1, 3))->toArray(),
                'leadership_experience' => collect(['Team Captain', 'Club President', 'Event Organizer', 'Peer Tutor', 'Project Lead'])->random(),
                'parent_contact_notes' => 'Parent meetings scheduled quarterly'
            ]);
        }
    }
}
