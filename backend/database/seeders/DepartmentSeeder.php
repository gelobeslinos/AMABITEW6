<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Engineering',
                'description' => 'Software development and technical operations',
                'manager_name' => 'John Smith',
                'location' => 'Floor 3',
                'budget' => 500000.00,
            ],
            [
                'name' => 'Human Resources',
                'description' => 'Employee management and recruitment',
                'manager_name' => 'Sarah Johnson',
                'location' => 'Floor 2',
                'budget' => 150000.00,
            ],
            [
                'name' => 'Sales',
                'description' => 'Business development and client relations',
                'manager_name' => 'Mike Wilson',
                'location' => 'Floor 1',
                'budget' => 300000.00,
            ],
            [
                'name' => 'Marketing',
                'description' => 'Brand management and marketing campaigns',
                'manager_name' => 'Emily Brown',
                'location' => 'Floor 2',
                'budget' => 200000.00,
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
