import {Schema, model } from "mongoose";


const VisitSchema = new Schema({
  name: String,
  assignedDoctor: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTherapist: { type: Schema.Types.ObjectId, ref: 'User' },
  visitDate: Date,
  hospital: String,
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
  notes: String,
});

const Visit = model('Visit', VisitSchema);

export default Visit;
