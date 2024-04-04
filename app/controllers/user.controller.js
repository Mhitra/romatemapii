
import User from "../models/user.js";
import axios from "axios"; 
import PatientExercises from "../models/PatientExercises.js";
import Exercises from "../models/Exercises.js";
import Case from "../models/case.js";
import Visit from "../models/visit.js";
import multer from "multer";
export const phoneverification = async (req, res) => {
function generateRandomToken(length) {
var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var token = '';
for (var i = 0; i < length; i++) {
token += characters.charAt(Math.floor(Math.random() * characters.length));
}    
    return token;  
  }
  var timestamp = Math.floor(Date.now() / 1000);
  var token = generateRandomToken(12);
  token += '_' + timestamp;
  try { 
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    const { phoneNumber } = req.body;
    let user = await User.findOneAndUpdate(
      { phonenumber: phoneNumber },
      { $set: { verificationcode: randomFourDigit, accessToken: token },
      $setOnInsert: { phonenumber: phoneNumber, numberverification: false }},
      { upsert: true, new: true });
    const API_KEY = "f2a5c1a59aa5b2ad08abe089e135eeed";
    const API_HASH = "e148b7665faeda9e45c6abc795eb0ed538ccf8af3024f9949531205b22e4128b";
    const text = `Your verification code is: ${randomFourDigit}`;

    const response = await axios.get(`https://api.iletimerkezi.com/v1/send-sms/get/?key=${API_KEY}&hash=${API_HASH}&text=${text}&receipents=${phoneNumber}&sender=EMRE KAYA&iys=0&iysList=BIREYSEL`);
if(response.status !== 200) res.status(500).json({message:"Error! Failed to send message. "})
    res.status(200).json({ message: "Phone number received", code: randomFourDigit, userisregister: user.numberverification ? true :false , token: token });
  } catch (error) {
    console.log(error);
  }
}

export const register = async (req, res) => {
  const { name, email, bloodtype, IDnumber, token ,expotoken , status, hospitalId} = req.body;
  if (!name || !email || !bloodtype || !IDnumber || !expotoken) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  let user = null;
  try {
    let alreadyRegistered = await User.findOne({ $or: [{ IDnumber }] }) 
    if (alreadyRegistered) return res.status(400).json({ message: "This ID number is already registered" });
    if(status== 1|| status == 2 || status == 3){
       user = await User.findOneAndUpdate(
        { $or: [{ accessToken: token }] },
        { name, email, bloodtype, numberverification: true, IDnumber ,expotoken, status, hospitalId},
        { new: true, upsert: true }
      );
      }else{
     user = await User.findOneAndUpdate(
      { $or: [{ accessToken: token }] },
      { name, email, bloodtype, numberverification: true, IDnumber ,expotoken  ,
        status
      },
      { new: true, upsert: true }
    );
  }

    if (user) {
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(400).json({ message: "User registration failed" });
    }
  } catch (error) {
    console.error("Error occurred during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const exercisetoday = async (req, res) => {
  try {
    const { PatientID } = req.params;
    const exercises = await PatientExercises.find({ PatientID });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filteredExercises = exercises.filter(({ EndDate, StartDate, periot }) => {
      const exerciseDate = new Date(StartDate);
      exerciseDate.setHours(0, 0, 0, 0);

      if (EndDate && new Date(EndDate) < today) {
        return false;
      }

      if (periot) {
        const diff = Math.abs(today - exerciseDate);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days % periot === 0 && exerciseDate <= today && exerciseDate < tomorrow;
      }

      return exerciseDate >= today && exerciseDate < tomorrow;
    });

    const hasExercisesToday = filteredExercises.length > 0;
    let exerciselist = [];

    if (hasExercisesToday) {
      const exerciseIds = filteredExercises.map(exercise => exercise.ExerciseID);
      exerciselist = await Exercises.find({ _id: { $in: exerciseIds } });
    }

    return res.status(200).json({ hasExercisesToday, exercises: exerciselist });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getuser = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne
    ({ accessToken: token });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
const upload = multer({ storage: multer.memoryStorage() }).single("file");

export const createcase = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      const file = req.file;
      const { PatientID , DoctorID } = req.params;
      const Patient = await User.findOne({ _id: PatientID });
      const Doctor = await User.findOne ({ _id: DoctorID });
      if (Patient && Doctor) {
        const { Title, Description } = req.body;
        let fileUrl = null;
        if(file){
          const fileName = file.originalname.toLowerCase().split(' ').join('-');
          const url = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_USERNAME}/${fileName}`;
          const config = {
            headers: {
              'AccessKey': process.env.BUNNY_ACCESS_KEY,
              'Content-Type': 'application/octet-stream',
            },
          };
          try {
            const response = await axios.put(url, file.buffer, config);
      
            if (response.status !== 201) {
              throw new Error('Video yüklenirken bir hata oluştu.');
            }
      
            fileUrl = `https://romatem.b-cdn.net/${fileName}`;
  
          } catch (error) {
            return res.status(500).json({ message: error.message });
          }
        }
        const newCase = new Case({
          DoctorID: DoctorID,
          PatientID: PatientID,
          Title: Title,
          Description: Description,
          Status: "Bekliyor",
        });
        if(fileUrl) newCase.file = fileUrl;
        await newCase.save();
        return res.status(200).json({ message: "Case created successfully" });
      } else {
        return res.status(400).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
}

export const getcase = async (req, res) => {
  try {
    const { PatientID } = req.params;
    const cases = await Case.find({
      PatientID,
    });
    return res.status(200).json(cases);
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const getallcases = async (req, res) => {
  try {
    const { DoctorID } = req.params;
    const cases = await Case.find({
      DoctorID,
    });
    return res.status(200).json(cases);
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

  export const addvisit = async (req, res) => {
    try {
      const { name, doctorId, therapistId, visitDate, hospital, exercises, notes } = req.body;

      // Create the new visit
      const visit = new Visit({
        name,
        assignedDoctor: doctorId,
        assignedTherapist: therapistId,
        visitDate,
        hospital,
        notes,
      });
    
      // Add the exercises to the visit
      for (let exercise of exercises) {
        const newExercise = new Exercises(exercise);
        await newExercise.save();
        visit.exercises.push(newExercise);
      }
    
      // Save the visit
      await visit.save();
    
      res.status(200).json({ message: 'Visit created successfully' });
    
    } catch (error) {
      
    }
  }
