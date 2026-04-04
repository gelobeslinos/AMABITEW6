<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->text('academic_history')->nullable()->after('academic_weaknesses');
            $table->text('non_academic_activities')->nullable()->after('academic_history');
            $table->text('violations')->nullable()->after('non_academic_activities');
            $table->json('affiliations')->nullable()->after('extracurricular_activities');
            $table->json('skills')->nullable()->after('affiliations');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'academic_history',
                'non_academic_activities',
                'violations',
                'affiliations',
                'skills',
            ]);
        });
    }
};

