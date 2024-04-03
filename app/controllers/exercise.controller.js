
import User from "../models/user.js";
import axios from "axios";
import PatientExercises from "../models/PatientExercises.js";
import Exercises from "../models/Exercises.js";
import multer from "multer";
/**
 * Adds a new exercise for a patient.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.patientId - The patient's ID. 
 * @param {string} req.body.doctorId - The doctor's ID.
 * @param {string} req.body.exerciseId - The exercise's ID.
 * @param {Date} req.body.startDate - The start date for the exercise.
 * @param {Date} req.body.endDate - The end date for the exercise. 
 * @param {string} req.body.status - The status of the exercise.
 * @param {Object} res - The response object. 
 * @returns {Promise} - Returns a promise that resolves to the saved exercise object.
*/
export async function addExercise(req, res) {
  const { patientId, doctorId, exerciseId, startDate, endDate, status , catagory} = req.body;

  const newExercise = new PatientExercises({
    PatientID: patientId,
    DoctorID: doctorId,
    ExerciseID: exerciseId,
    StartDate: new Date(startDate),
    EndDate: new Date(endDate),
    Status: status,
    Catagory: catagory
  });


  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const savedExercise = await newExercise.save({ session });
    await User.updateOne(
      { _id: patientId },
      { $push: { Exercises: savedExercise._id } },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(savedExercise);
  } catch (err) {
    res.status(400).json({ message: err });
  }
}
/**
 * Updates an exercise by ID.
 * 
 * @param {Object} req - Express request object 
 * @param {string} req.params.exerciseId - The ID of the exercise to update
 * @param {Object} req.body - The update to apply to the exercise
 * @param {Object} res - Express response object
 * @returns {Promise}
 */
export async function updateExercise(req, res) {
  const { exerciseId } = req.params;
  try {
    await Exercises.findOneAndUpdate(
      { _id: exerciseId },
      { $set: req.body }
    );
    res.status(200).json({ message: "Egzersiz başarıyla güncellendi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}

/**
 * Gets exercises for a patient.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.patientId - The ID of the patient
 * @param {Object} res - Express response object 
 * @returns {Promise} A promise that resolves with the patient's exercises
*/
export async function getExercises(req, res) {
  const { patientId } = req.params;
  try {
    const patientExercises = await PatientExercises.find({ PatientID: patientId });
    const exerciseIds = patientExercises.map(exercise => exercise.ExerciseID);
    const exerciseList = await Promise.all(exerciseIds.map(id => Exercises.findById(id)));

    res.status(200).json({
      exercises: patientExercises,
      exercises_info: exerciseList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
/**
 * Gets exercises assigned to a doctor's patients.
 *
 * @param {Object} req - Express request object 
 * @param {string} req.params.doctorId - The ID of the doctor
 * @param {Object} res - Express response object
 * @returns {Promise} A promise that resolves with the exercises
 */
export async function getExercisesByDoctor(req, res) {
  const { doctorId } = req.params;
  try {
    const exercises = await PatientExercises.find({ DoctorID: doctorId });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Gets exercises assigned to a patient by status.
 * 
 * @param {Object} req - Express request object 
 * @param {string} req.params.status - The status of exercises to find
 * @param {Object} res - Express response object
 * @returns {Promise} A promise that resolves with the found exercises
 */
export async function getExercisesByStatus(req, res) {
  const { status } = req.params;
  try {
    const exercises = await PatientExercises.find({ Status: status });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const upload = multer({ storage: multer.memoryStorage() }).single("videoFile");
/**
 * Uploads a new exercise video and saves the exercise details.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 * Uploads the video file from the request. 
 * Validates and saves the new exercise data.
 * Returns 201 with saved exercise on success, or error status code with message on failure.
 */
export async function newExercise(req, res) {
  upload(req, res, async (err) => {
    if (err) { return res.status(400).json({ message: err.message }) }
    const videofile = req.file;
    if (!videofile) {
      return res.status(400).json({ message: "Video dosyası yüklenemedi." });
    }
    const videoName = videofile.originalname.toLowerCase().split(' ').join('-');
    const url = `https://${process.env.BUNNY_STORAGE_API_HOST}/${process.env.BUNNY_USERNAME}/${videoName}`;
    const config = {
      headers: {
        'AccessKey': process.env.BUNNY_ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
    };
    try {
      const response = await axios.put(url, videofile.buffer, config);

      if (response.status !== 201) {
        throw new Error('Video yüklenirken bir hata oluştu.');
      }

      const videoUrl = `https://romatem.b-cdn.net/${videoName}`;
      const { exerciseName, numberOfRepetitions, exerciseDuration, explanation } = req.body;
      const newExercise = new Exercises({
        ExerciseName: exerciseName,
        numberofexerciseRepetitions: numberOfRepetitions,
        ExerciseDuration: exerciseDuration,
        Explanation: explanation,
        videoUrl: videoUrl,
      });

      const savedExercise = await newExercise.save();
      res.status(201).json(savedExercise);
    } catch (error) {
      console.error('Hata:', error.message);
      res.status(500).json({ message: error.message });
    }
  });
}

/**
 * Marks an exercise as completed by a patient.
 * 
 * Updates the exercise document to set the completed status, end date, 
 * and number of days taken to complete the exercise.
 * 
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
*/
export async function completeExercise(req, res) {
  const { exerciseId } = req.params;
  try {
    let exercise = await PatientExercises.findOne({ _id: exerciseId });
    if (!exercise) {
      return res.status(404).json({ message: "Egzersiz bulunamadı." });
    }
    const startTime = new Date(exercise.StartDate);
    const endTime = new Date(exercise.EndDate);
    const difference = endTime - startTime;
    const dayNumber = Math.floor(difference / (1000 * 60 * 60 * 24));
    await PatientExercises.findOneAndUpdate(
      { _id: exerciseId },
      {
        $set: {
          Days: {
            dayNumber: dayNumber,
            completed: true,
            date: new Date()
          }
        }
      }
    );
    res.status(200).json({ message: "Egzersiz başarıyla tamamlandı." });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}