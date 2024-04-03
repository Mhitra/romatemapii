import {
  Schema, model
} from "mongoose";

const userSchema = Schema({
  name: {
    type: String,
  },
  IDnumber: {
    type: String,
  },
  bloodtype: {
    type: String,
  },
  email: {
    type: String,
  },
  numberverification: {
   type: Boolean,
    default: false
  },
  gender : {
    type: Boolean,
  },
  dateofbirth: {
    type: String,
  },
  spelialization: {
    type: String,
  },
  verificationcode: {
    type: Number,
  },
  status: {
    type: Number,
    default: 5,
    required: true
  },
  hospitalId: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  phonenumber:{
    type: String,
    unique: true,
    required: true
  },
  expotoken: {
    type: String,
  },
  Exercises: {
    type:Object,
  }
});

export default model("User", userSchema);
