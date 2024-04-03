import {
    Schema, model
  } from "mongoose";
  
  const CaseSchema = Schema({
    DoctorID: {
      type: Schema.Types.ObjectId,
      ref: "User",
        required: true,
    },
    PatientID: {
      type: Schema.Types.ObjectId,
      ref: "User",
        required: true,
    },
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      required: true,
      enum: ["Açık", "Bekliyor", "Kapalı"],
    },
    Date: {
      type: Date,
      default: Date.now,
    },
    file: {
      type: String,

    },
  });
  
  export default model("Case", CaseSchema);
  