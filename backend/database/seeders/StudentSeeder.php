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
                'phone' => '09123456790',
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
                'phone' => '09123456791',
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
                'phone' => '09123456792',
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
                'phone' => '09123456793',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
            [
                'student_id' => '1901855',
                'first_name' => 'Patricia',
                'last_name' => 'Lim',
                'email' => 'patricia.lim@pnc.edu.ph',
                'phone' => '09123456794',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 2,
                'status' => 'active',
                'date_enrolled' => '2023-06-15'
            ],
            [
                'student_id' => '1901856',
                'first_name' => 'Miguel',
                'last_name' => 'Tan',
                'email' => 'miguel.tan@pnc.edu.ph',
                'phone' => '09123456795',
                'program' => 'Information Technology',
                'year_level' => 4,
                'status' => 'active',
                'date_enrolled' => '2021-06-15'
            ],
            [
                'student_id' => '1901857',
                'first_name' => 'Sofia',
                'last_name' => 'Cruz',
                'email' => 'sofia.cruz@pnc.edu.ph',
                'phone' => '09123456796',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 1,
                'status' => 'active',
                'date_enrolled' => '2024-06-15'
            ],
            [
                'student_id' => '1901858',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@pnc.edu.ph',
                'phone' => '09123456797',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
            [
                'student_id' => '1901859',
                'first_name' => 'Kristine',
                'last_name' => 'Villanueva',
                'email' => 'kristine.villanueva@pnc.edu.ph',
                'phone' => '09123456798',
                'program' => 'Information Technology',
                'year_level' => 2,
                'status' => 'active',
                'date_enrolled' => '2023-06-15'
            ],
            [
                'student_id' => '1901860',
                'first_name' => 'Mark',
                'last_name' => 'Pineda',
                'email' => 'mark.pineda@pnc.edu.ph',
                'phone' => '09123456799',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 4,
                'status' => 'active',
                'date_enrolled' => '2021-06-15'
            ],
            [
                'student_id' => '1901861',
                'first_name' => 'Angelica',
                'last_name' => 'Ramos',
                'email' => 'angelica.ramos@pnc.edu.ph',
                'phone' => '09123456800',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 1,
                'status' => 'active',
                'date_enrolled' => '2024-06-15'
            ],
            [
                'student_id' => '1901862',
                'first_name' => 'Daniel',
                'last_name' => 'Mendoza',
                'email' => 'daniel.mendoza@pnc.edu.ph',
                'phone' => '09123456801',
                'program' => 'Information Technology',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
            [
                'student_id' => '1901863',
                'first_name' => 'Rachel',
                'last_name' => 'Flores',
                'email' => 'rachel.flores@pnc.edu.ph',
                'phone' => '09123456802',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 2,
                'status' => 'active',
                'date_enrolled' => '2023-06-15'
            ],
            [
                'student_id' => '1901864',
                'first_name' => 'Francis',
                'last_name' => 'Castro',
                'email' => 'francis.castro@pnc.edu.ph',
                'phone' => '09123456803',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 4,
                'status' => 'active',
                'date_enrolled' => '2021-06-15'
            ],
            [
                'student_id' => '1901865',
                'first_name' => 'Michelle',
                'last_name' => 'Bautista',
                'email' => 'michelle.bautista@pnc.edu.ph',
                'phone' => '09123456804',
                'program' => 'Information Technology',
                'year_level' => 1,
                'status' => 'active',
                'date_enrolled' => '2024-06-15'
            ],
            [
                'student_id' => '1901866',
                'first_name' => 'Ryan',
                'last_name' => 'Reyes',
                'email' => 'ryan.reyes@pnc.edu.ph',
                'phone' => '09123456805',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 3,
                'status' => 'active',
                'date_enrolled' => '2022-06-15'
            ],
            [
                'student_id' => '1901867',
                'first_name' => 'Jasmine',
                'last_name' => 'Lee',
                'email' => 'jasmine.lee@pnc.edu.ph',
                'phone' => '09123456806',
                'program' => 'Bachelor of Science in Computer Science',
                'year_level' => 2,
                'status' => 'active',
                'date_enrolled' => '2023-06-15'
            ],
            [
                'student_id' => '1901868',
                'first_name' => 'Christopher',
                'last_name' => 'Ng',
                'email' => 'christopher.ng@pnc.edu.ph',
                'phone' => '09123456807',
                'program' => 'Information Technology',
                'year_level' => 4,
                'status' => 'active',
                'date_enrolled' => '2021-06-15'
            ],
            [
                'student_id' => '1901869',
                'first_name' => 'Vanessa',
                'last_name' => 'Chua',
                'email' => 'vanessa.chua@pnc.edu.ph',
                'phone' => '09123456808',
                'program' => 'Bachelor of Science in Information Technology',
                'year_level' => 1,
                'status' => 'active',
                'date_enrolled' => '2024-06-15'
            ],
            [
                'student_id' => '1901870',
                'first_name' => 'Gabriel',
                'last_name' => 'Martinez',
                'email' => 'gabriel.martinez@pnc.edu.ph',
                'phone' => '09123456809',
                'program' => 'Bachelor of Science in Computer Science',
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
