<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Employee;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        // Current `employees` migration does NOT have `department_id`.
        // Seed only the columns that exist.
        $employees = [
            [
                'first_name' => 'Alice',
                'last_name' => 'Anderson',
                'email' => 'alice.anderson@company.com',
                'phone' => '555-0101',
                'position' => 'Senior Developer',
                'salary' => 95000.00,
                'hire_date' => '2022-01-15',
                'status' => 'active',
            ],
            [
                'first_name' => 'Bob',
                'last_name' => 'Baker',
                'email' => 'bob.baker@company.com',
                'phone' => '555-0102',
                'position' => 'Junior Developer',
                'salary' => 65000.00,
                'hire_date' => '2023-03-20',
                'status' => 'active',
            ],
            [
                'first_name' => 'Carol',
                'last_name' => 'Clark',
                'email' => 'carol.clark@company.com',
                'phone' => '555-0103',
                'position' => 'Dean',
                'salary' => 75000.00,
                'hire_date' => '2021-06-10',
                'status' => 'active',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Davis',
                'email' => 'david.davis@company.com',
                'phone' => '555-0104',
                'position' => 'Dept Chair',
                'salary' => 55000.00,
                'hire_date' => '2023-02-01',
                'status' => 'active',
            ],
            [
                'first_name' => 'Emma',
                'last_name' => 'Evans',
                'email' => 'emma.evans@company.com',
                'phone' => '555-0105',
                'position' => 'Marketing Specialist',
                'salary' => 60000.00,
                'hire_date' => '2022-09-15',
                'status' => 'active',
            ],
        ];

        foreach ($employees as $employee) {
            Employee::create($employee);
        }
    }
}
