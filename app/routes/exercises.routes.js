import express from 'express';
import * as ExerciseController from "../controllers/exercise.controller.js";
import User from "../models/user.js";

const router = express.Router();

async function isAuthenticated(req, res, next) {
  const publicPaths = ["/phoneVerification"];
  let token = req.headers.authorization?.split(" ")[1];
  if (token) {
    let user = await User.findOne({ accessToken: token });
    if (user) {
      req.isAuthenticated = () => true;
      req.body.token = token;
      req.body.user_status = user?.status; 
    }
  } 
  if (publicPaths.includes(req.path) || req.isAuthenticated()) {
    next(); 
  } else {
    res.status(401).json({ message: "Kimlik doğrulama gerekiyor" });
  }
}

router.use(isAuthenticated);

router.post("/addexercises", async (req, res) => {
  ExerciseController.addExercise(req, res);
});
router.post("/newexercises", async (req, res) => {
  console.log("newexercises");
  ExerciseController.newExercise(req, res);
});
router.put("/updateexercises/:exerciseId", async (req, res) => {
  ExerciseController.updateExercise(req, res);
});
router.get("/exercises/:patientId", async (req, res) => {
  ExerciseController.getExercises(req, res);
});
router.get("exercisesdoctor/:doctorId/", async (req, res) => {
  ExerciseController.getExercisesByDoctor(req, res);
});
router.put("/completeExercise/:exerciseId", async (req, res) => {
  ExerciseController.completeExercise(req, res);
});
router.post("/admin/addExercise", async (req, res) => {
  ExerciseController.addExercise(req, res);
});

router.delete("/admin/deleteExercise/:exerciseId", async (req, res) => {
  ExerciseController.deleteExercise(req, res);
});

router.put("/admin/updateExercise/:exerciseId", async (req, res) => {
  ExerciseController.updateExercise(req, res);
});

export default router;