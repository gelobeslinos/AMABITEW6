<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('learning_style')->nullable();
            $table->text('academic_strengths')->nullable();
            $table->text('academic_weaknesses')->nullable();
            $table->decimal('gpa', 8, 2)->nullable();
            $table->string('career_aspiration')->nullable();
            $table->text('personal_goals')->nullable();
            $table->json('special_needs')->nullable();
            $table->text('counselor_notes')->nullable();
            $table->boolean('needs_intervention')->default(false);
            $table->text('intervention_notes')->nullable();
            $table->json('extracurricular_activities')->nullable();
            $table->text('leadership_experience')->nullable();
            $table->text('parent_contact_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
