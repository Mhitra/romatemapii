import {
  Schema, model
} from "mongoose";

const hostpitalSchema = Schema({
  hospital_image: {
    type: String,
  },
  hospital_name: {
    type: String,
    required: true,
  },
  hospital_address: {
    type: String,
    required: true,
  },
  treatments:{
    type:Array,
  },
  technologies:{
    type:Array,
  },
    doctors: [{
      type: Schema.Types.ObjectId,
      ref: 'User' 
    }]
});

export default model("Hospital", hostpitalSchema);
