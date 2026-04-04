<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'student_id' => '1901850',
                'first_name' => 'Angelo',
                'last_name' => 'Miguel',
                'email' => 'angelo.beslinos@pnc.edu.ph',
                'phone' => '09123456789',
                'program' => 'Information Technology',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
            [
                'student_id' => '1901851',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'email' => 'maria.santos@pnc.edu.ph',
                'phone' => '09123456789',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 2,
                'status' => 'active',
                'date_enrolled' => '2023-06-15'
            ],
            [
                'student_id' => '1901852',
                'first_name' => 'Jose',
                'last_name' => 'Reyes',
                'email' => 'jose.reyes@pnc.edu.ph',
                'phone' => '09123456789',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 4,
                'status' => 'active',
                'date_enrolled' => '2021-06-15'
            ],
            [
                'student_id' => '1901853',
                'first_name' => 'Ana',
                'last_name' => 'Garcia',
                'email' => 'ana.garcia@pnc.edu.ph',
                'phone' => '09123456789',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 1,
                'status' => 'active',
                'date_enrolled' => '2024-06-15'
            ],
            [
                'student_id' => '1901854',
                'first_name' => 'Carlos',
                'last_name' => 'Lopez',
                'email' => 'carlos.lopez@pnc.edu.ph',
                'phone' => '09123456789',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
        ];

        foreach ($students as $student) {
            Student::create($student);
        }
    }
}
