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
        Schema::create('student_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('interest_category');
            $table->string('interest_name');
            $table->string('proficiency_level');
            $table->text('description')->nullable();
            $table->boolean('is_primary_interest')->default(false);
            $table->integer('years_of_experience')->default(0);
            $table->json('achievements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_interests');
    }
};
