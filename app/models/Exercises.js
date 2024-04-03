import {Schema, model } from "mongoose";

const Exercises = Schema({
  videoUrl: {
    type: String,
    unique: true,
    required: true,
  },
  ExerciseName: {
    type: String,
    required: true
  },
  numberofexerciseRepetitions: {
    type: Number,
    required: true,
  },
  ExerciseDuration: {
    type: Number,
    required: true,
  },
  Explanation: {
    type: String,
    required: true,
  },
  targetedMuscleGroups: {
    type: [String],
    required: true,
  },
  requiredEquipment: {
    type: [String],
    required: true,
  },
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
});

export default model("Exercises", Exercises);