<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $roles = [
            ['name' => 'admin'],
            ['name' => 'faculty'],
            ['name' => 'student'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        $this->command->info('Roles created: admin, faculty, student');
    }
}
