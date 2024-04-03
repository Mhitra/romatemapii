import express from "express";
import * as UserController from "../controllers/user.controller.js";
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
      req.body.status = user?.status;
    }
  }
  if (publicPaths.includes(req.path) || req.isAuthenticated()) {
    next(); 
  } else {
    res.status(401).json({ message: "Kimlik doğrulama gerekiyor" });
  }
}

router.use(isAuthenticated);

router.post("/phoneVerification", async (req, res) => {
  UserController.phoneverification(req, res);
});
router.post("/register", async (req, res) => {
  UserController.register(req, res);
});
router.get("/exercisetoday/:PatientID", async (req, res) => {
  UserController.exercisetoday(req, res);
});

router.get("/userinfo/", async (req, res) => {
  UserController.getuser(req, res);
});
router.post("/createcase/:PatientID/:DoctorID", async (req, res) => {
  UserController.createcase(req, res);
});
router.get("/getcase/:PatientID", async (req, res) => {
  UserController.getcase(req, res);
});
router.get("/getallcases/:DoctorID", async (req, res) => {
  UserController.getallcases(req, res);
});
router.post("/addvisit", async (req, res) => {
  UserController.addvisit(req, res);
});

export default router;
