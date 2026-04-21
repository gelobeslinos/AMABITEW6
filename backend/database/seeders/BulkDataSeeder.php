<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Student;
use App\Models\StudentProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class BulkDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->command->info('Starting bulk data generation...');
        
        // Generate 50 Professors
        $this->command->info('Generating 50 professors...');
        $professorPositions = [
            'Professor of Computer Science',
            'Professor of Mathematics',
            'Professor of Physics',
            'Professor of Chemistry',
            'Professor of Biology',
            'Associate Professor of Computer Science',
            'Associate Professor of Mathematics',
            'Assistant Professor of Physics',
            'Assistant Professor of Chemistry',
            'Lecturer in Biology'
        ];

        $professors = [];
        for ($i = 1; $i <= 50; $i++) {
            $firstName = $this->generateFirstName();
            $lastName = $this->generateLastName();
            
            $professors[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower($firstName . '.' . $lastName . $i . '@university.edu'),
                'phone' => $this->generatePhoneNumber(),
                'position' => $professorPositions[array_rand($professorPositions)],
                'salary' => rand(60000, 150000) + (rand(0, 99) / 100),
                'hire_date' => $this->generateRandomDate('2010-01-01', '2023-12-31'),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('employees')->insert($professors);
        $this->command->info('50 professors created successfully!');

        // Generate 1000 Students
        $this->command->info('Generating 1000 students with profiles...');
        $programs = [
            'Computer Science',
            'Information Technology',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'Engineering',
            'Business Administration',
            'Economics',
            'Psychology'
        ];

        $students = [];
        $studentProfiles = [];
        
        for ($i = 1; $i <= 1000; $i++) {
            $firstName = $this->generateFirstName();
            $lastName = $this->generateLastName();
            $studentId = 'STU' . str_pad($i, 6, '0', STR_PAD_LEFT);
            
            $students[] = [
                'student_id' => $studentId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower($firstName . '.' . $lastName . $i . '@student.university.edu'),
                'phone' => $this->generatePhoneNumber(),
                'year_level' => rand(1, 4),
                'program' => $programs[array_rand($programs)],
                'status' => 'active',
                'date_enrolled' => $this->generateRandomDate('2020-01-01', '2024-01-01'),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('students')->insert($students);
        $this->command->info('1000 students created successfully!');

        // Generate Student Profiles
        $this->command->info('Creating student profiles...');
        $studentIds = DB::table('students')->pluck('id');
        
        foreach ($studentIds as $studentId) {
            $profile = [
                'student_id' => $studentId,
                'learning_style' => $this->generateLearningStyle(),
                'academic_strengths' => $this->generateAcademicStrengths(),
                'academic_weaknesses' => $this->generateAcademicWeaknesses(),
                'gpa' => round(rand(250, 400) / 100, 2), // GPA between 2.50 and 4.00
                'career_aspiration' => $this->generateCareerAspiration(),
                'personal_goals' => $this->generatePersonalGoals(),
                'special_needs' => rand(0, 10) > 8 ? json_encode([$this->generateSpecialNeed()]) : null,
                'counselor_notes' => rand(0, 10) > 7 ? $this->generateCounselorNotes() : null,
                'needs_intervention' => rand(0, 10) > 8,
                'intervention_notes' => rand(0, 10) > 8 ? $this->generateInterventionNotes() : null,
                'extracurricular_activities' => json_encode($this->generateExtracurricularActivities()),
                'leadership_experience' => rand(0, 10) > 6 ? $this->generateLeadershipExperience() : null,
                'parent_contact_notes' => rand(0, 10) > 7 ? $this->generateParentContactNotes() : null,
                'academic_history' => $this->generateAcademicHistory(),
                'non_academic_activities' => $this->generateNonAcademicActivities(),
                'violations' => rand(0, 10) > 9 ? $this->generateViolations() : null,
                'affiliations' => json_encode($this->generateAffiliations()),
                'skills' => json_encode($this->generateSkills()),
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $studentProfiles[] = $profile;
        }

        // Insert profiles in chunks to avoid memory issues
        $chunks = array_chunk($studentProfiles, 100);
        foreach ($chunks as $chunk) {
            DB::table('student_profiles')->insert($chunk);
        }

        $this->command->info('1000 student profiles created successfully!');
        $this->command->info('Bulk data generation completed!');
    }

    private function generateFirstName(): string
    {
        $firstNames = [
            'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
            'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
            'Laura', 'Sarah', 'Kimberly', 'Ashley', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon'
        ];
        return $firstNames[array_rand($firstNames)];
    }

    private function generateLastName(): string
    {
        $lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
        ];
        return $lastNames[array_rand($lastNames)];
    }

    private function generatePhoneNumber(): string
    {
        return '+1' . rand(200, 999) . '-' . rand(200, 999) . '-' . rand(1000, 9999);
    }

    private function generateRandomDate($startDate, $endDate): string
    {
        $startTimestamp = strtotime($startDate);
        $endTimestamp = strtotime($endDate);
        $randomTimestamp = mt_rand($startTimestamp, $endTimestamp);
        return date('Y-m-d', $randomTimestamp);
    }

    private function generateLearningStyle(): string
    {
        $styles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed'];
        return $styles[array_rand($styles)];
    }

    private function generateAcademicStrengths(): string
    {
        $strengths = [
            'Strong analytical thinking and problem-solving skills',
            'Excellent verbal and written communication',
            'Advanced mathematical abilities',
            'Creative thinking and innovation',
            'Strong research and critical analysis skills',
            'Leadership and teamwork abilities',
            'Technical proficiency in programming',
            'Scientific methodology and experimental design'
        ];
        return $strengths[array_rand($strengths)];
    }

    private function generateAcademicWeaknesses(): string
    {
        $weaknesses = [
            'Needs improvement in time management',
            'Difficulty with public speaking',
            'Struggles with advanced mathematics',
            'Limited experience in laboratory work',
            'Challenges in group collaboration',
            'Needs to develop better study habits',
            'Difficulty with theoretical concepts',
            'Limited foreign language skills'
        ];
        return $weaknesses[array_rand($weaknesses)];
    }

    private function generateCareerAspiration(): string
    {
        $aspirations = [
            'Software Engineer at a tech company',
            'Research Scientist in academia',
            'Data Scientist',
            'Medical Doctor',
            'Business Consultant',
            'University Professor',
            'Financial Analyst',
            'Environmental Scientist',
            'Product Manager',
            'Entrepreneur'
        ];
        return $aspirations[array_rand($aspirations)];
    }

    private function generatePersonalGoals(): string
    {
        $goals = [
            'Maintain GPA above 3.5 throughout college',
            'Complete internship before graduation',
            'Learn a new programming language',
            'Study abroad for one semester',
            'Publish research paper in peer-reviewed journal',
            'Graduate with honors',
            'Start a student organization',
            'Complete marathon before graduation'
        ];
        return $goals[array_rand($goals)];
    }

    private function generateSpecialNeed(): string
    {
        $needs = [
            'Extended test time',
            'Note-taking assistance',
            'Preferential seating',
            'Alternative format materials',
            'Assistive technology'
        ];
        return $needs[array_rand($needs)];
    }

    private function generateCounselorNotes(): string
    {
        $notes = [
            'Student shows great potential but needs motivation',
            'Excellent progress this semester',
            'Consider tutoring for mathematics',
            'Strong leadership qualities observed',
            'Needs guidance in career planning',
            'Well-adjusted socially and academically',
            'Shows improvement in time management',
            'Active participant in class discussions'
        ];
        return $notes[array_rand($notes)];
    }

    private function generateInterventionNotes(): string
    {
        $notes = [
            'Weekly academic counseling recommended',
            'Peer tutoring arranged for struggling subjects',
            'Study skills workshop attendance required',
            'Regular progress meetings with advisor',
            'Time management coaching implemented',
            'Stress management techniques introduced',
            'Career counseling sessions scheduled',
            'Academic probation monitoring plan active'
        ];
        return $notes[array_rand($notes)];
    }

    private function generateExtracurricularActivities(): array
    {
        $activities = [
            'Basketball Team', 'Debate Club', 'Student Government', 'Drama Club',
            'Chess Club', 'Environmental Club', 'Programming Club', 'Music Band',
            'Volunteer Group', 'Photography Club', 'Writing Club', 'Science Club'
        ];
        
        $numActivities = rand(1, 3);
        $selectedActivities = [];
        $indices = array_rand($activities, $numActivities);
        
        if (!is_array($indices)) {
            $indices = [$indices];
        }
        
        foreach ($indices as $index) {
            $selectedActivities[] = $activities[$index];
        }
        
        return $selectedActivities;
    }

    private function generateLeadershipExperience(): string
    {
        $experiences = [
            'President of Student Council',
            'Captain of Basketball Team',
            'Editor of School Newspaper',
            'Leader of Volunteer Group',
            'Coordinator of Charity Event',
            'Head of Programming Club',
            'Team Lead for Class Project',
            'Mentor for Junior Students'
        ];
        return $experiences[array_rand($experiences)];
    }

    private function generateParentContactNotes(): string
    {
        $notes = [
            'Parents very supportive of academic goals',
            'Regular communication maintained',
            'Parents concerned about recent grades',
            'Family encourages extracurricular participation',
            'Parents request weekly progress updates',
            'Supportive of career counseling',
            'Concerned about stress levels',
            'Appreciate regular communication'
        ];
        return $notes[array_rand($notes)];
    }

    private function generateAcademicHistory(): string
    {
        $histories = [
            'Consistent academic performance throughout high school',
            'Significant improvement in recent semesters',
            'Strong performance in STEM subjects',
            'Excellence in humanities and social sciences',
            'Varied performance with upward trend',
            'Honors student in previous institution',
            'Transfer student with good standing',
            'Consistent Dean\'s List achievement'
        ];
        return $histories[array_rand($histories)];
    }

    private function generateNonAcademicActivities(): string
    {
        $activities = [
            'Regular volunteer at local food bank',
            'Part-time retail job on weekends',
            'Community sports league participation',
            'Church youth group involvement',
            'Family business assistance',
            'Online content creation',
            'Freelance graphic design work',
            'Community theater participation'
        ];
        return $activities[array_rand($activities)];
    }

    private function generateViolations(): string
    {
        $violations = [
            'Minor attendance issues - resolved',
            'Late assignment submission warning',
            'Library book return delay',
            'Minor classroom disruption - addressed',
            'Parking violation ticket',
            'Dress code reminder',
            'Noise complaint in dormitory',
            'Computer usage policy reminder'
        ];
        return $violations[array_rand($violations)];
    }

    private function generateAffiliations(): array
    {
        $affiliations = [
            'National Honor Society', 'Computer Science Association', 'Engineering Society',
            'Business Club', 'Pre-Med Society', 'Environmental Organization',
            'International Student Association', 'Athletic Association'
        ];
        
        $numAffiliations = rand(0, 2);
        if ($numAffiliations === 0) return [];
        
        $selectedAffiliations = [];
        $indices = array_rand($affiliations, $numAffiliations);
        
        if (!is_array($indices)) {
            $indices = [$indices];
        }
        
        foreach ($indices as $index) {
            $selectedAffiliations[] = $affiliations[$index];
        }
        
        return $selectedAffiliations;
    }

    private function generateSkills(): array
    {
        $skills = [
            'Python Programming', 'Java Development', 'Web Design', 'Data Analysis',
            'Public Speaking', 'Project Management', 'Spanish Language', 'Graphic Design',
            'Statistical Analysis', 'Laboratory Techniques', 'Creative Writing', 'Leadership'
        ];
        
        $numSkills = rand(2, 5);
        $selectedSkills = [];
        $indices = array_rand($skills, $numSkills);
        
        if (!is_array($indices)) {
            $indices = [$indices];
        }
        
        foreach ($indices as $index) {
            $selectedSkills[] = $skills[$index];
        }
        
        return $selectedSkills;
    }
}
