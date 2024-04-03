import {
  Schema, model 
}
from 'mongoose';

const PatientExerciseSchema = new Schema({
  PatientID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  DoctorID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  ExerciseID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  StartDate: {
    type: Date,
    required: true
  },
  EndDate: {
    type: Date,
    required: true
  },
  periot: {
    type: Number,
    required: true
  },
  Days: [{
    dayNumber: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]});

export default model('PatientExercise', PatientExerciseSchema);
