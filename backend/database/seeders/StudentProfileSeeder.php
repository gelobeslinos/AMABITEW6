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
        
        // Define comprehensive data pools
        $academicHistories = [
            'Consistent honor roll student throughout high school with strong performance in mathematics and sciences',
            'Participated in regional science competitions and won 2nd place in 2023',
            'Completed advanced placement courses in Computer Science and Calculus',
            'Active participant in academic decathlon, specializing in literature and history',
            'Dean\'s list for 3 consecutive semesters with major in Information Technology',
            'Transferred from community college with excellent academic standing',
            'Strong background in STEM subjects with multiple coding competition awards',
            'Completed summer internship at tech company with positive performance review',
            'Research assistant in university computer lab for 1 year',
            'Participant in student exchange program with focus on technology studies'
        ];
        
        $nonAcademicActivities = [
            'Member of university basketball team, regular practice 3x per week',
            'Volunteer at local community center teaching basic computer skills to seniors',
            'Active member of student government, serving as class representative',
            'Part-time web developer for small local businesses',
            'Campus tour guide for prospective students and parents',
            'Photography club member, contributes to university newsletter',
            'Peer mentor for freshman students in IT program',
            'Organizer of annual campus tech hackathon event',
            'Volunteer for campus environmental sustainability initiatives',
            'Member of university choir and participates in quarterly performances'
        ];
        
        $skills = [
            ['Programming', 'Web Development', 'Database Management', 'Problem Solving'],
            ['JavaScript', 'React', 'Node.js', 'Git', 'Agile methodologies'],
            ['Python', 'Machine Learning', 'Data Analysis', 'Statistics', 'Research'],
            ['Java', 'Spring Boot', 'Microservices', 'Cloud Computing', 'DevOps'],
            ['C++', 'Algorithms', 'Data Structures', 'Competitive Programming'],
            ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
            ['Mobile Development', 'React Native', 'Flutter', 'iOS Development'],
            ['Cybersecurity', 'Network Security', 'Ethical Hacking', 'Cryptography'],
            ['Project Management', 'Team Leadership', 'Communication', 'Presentation'],
            ['Game Development', 'Unity', 'C#', '3D Modeling', 'Animation']
        ];
        
        $affiliations = [
            ['Computer Science Society', 'Association for Computing Machinery'],
            ['Philippine Computer Society', 'IT Professionals Network'],
            ['Student Government', 'Council of Student Organizations'],
            ['Varsity Sports Team', 'University Athletic Association'],
            ['Debate Club', 'Model United Nations'],
            ['Tech Innovation Club', 'Startup Founders Group'],
            ['Environmental Club', 'Sustainability Initiative'],
            ['Arts and Culture Society', 'Creative Writers Guild'],
            ['Business Administration Club', 'Entrepreneurship Society'],
            ['Research and Development Club', 'Academic Excellence Society']
        ];
        
        $violations = [
            null, // No violations for most students
            null,
            null,
            'Late submission of project requirements (1 instance)',
            'Minor attendance issues in non-major subjects (2 instances)',
            null,
            'Library book return delay (resolved)',
            null,
            null,
            'Class disruption warning (resolved with counseling)'
        ];
        
        foreach ($students as $index => $student) {
            StudentProfile::create([
                'student_id' => $student->id,
                'learning_style' => collect(['visual', 'auditory', 'kinesthetic', 'reading_writing'])->random(),
                'academic_strengths' => collect(['Critical thinking', 'Problem solving', 'Creativity', 'Leadership', 'Communication', 'Analytical skills', 'Team collaboration', 'Technical writing', 'Public speaking', 'Research skills'])->random(3)->implode(', '),
                'academic_weaknesses' => collect(['Time management', 'Public speaking', 'Math anxiety', 'Test anxiety', 'Perfectionism', 'Procrastination', 'Group work dynamics', 'Advanced mathematics', 'Documentation writing', 'Stress management'])->random(2)->implode(', '),
                'academic_history' => $academicHistories[$index % count($academicHistories)],
                'non_academic_activities' => $nonAcademicActivities[$index % count($nonAcademicActivities)],
                'violations' => $violations[$index % count($violations)],
                'gpa' => round(mt_rand(250, 400) / 100, 2), // Random GPA between 2.50 and 4.00
                'career_aspiration' => collect(['Software Engineer', 'Data Scientist', 'IT Manager', 'Web Developer', 'Systems Analyst', 'Project Manager', 'Cybersecurity Specialist', 'AI/ML Engineer', 'Product Manager', 'DevOps Engineer', 'Full Stack Developer', 'Mobile App Developer'])->random(),
                'personal_goals' => collect(['Graduate with honors', 'Start own business', 'Work in tech industry', 'Pursue master\'s degree', 'Get internship at top tech company', 'Build professional network', 'Become certified professional', 'Start tech startup', 'Work abroad', 'Contribute to open source'])->random(3)->implode(', '),
                'special_needs' => null,
                'counselor_notes' => 'Initial profile created during system setup',
                'needs_intervention' => mt_rand(0, 10) > 8, // 20% chance of needing intervention
                'intervention_notes' => mt_rand(0, 10) > 8 ? 'Requires additional academic support' : null,
                'extracurricular_activities' => collect(['Student Council', 'Tech Club', 'Debate Team', 'Sports Team', 'Volunteer Work', 'Research Assistant', 'Music Club', 'Art Society', 'Drama Club', 'Science Club'])->random(mt_rand(1, 3))->toArray(),
                'affiliations' => $affiliations[$index % count($affiliations)],
                'skills' => $skills[$index % count($skills)],
                'leadership_experience' => collect(['Team Captain', 'Club President', 'Event Organizer', 'Peer Tutor', 'Project Lead', 'Committee Chair', 'Group Leader', 'Mentor', 'Coordinator', 'Facilitator'])->random(),
                'parent_contact_notes' => 'Parent meetings scheduled quarterly'
            ]);
        }
    }
}
