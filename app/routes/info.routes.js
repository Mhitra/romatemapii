import express from 'express';
import * as infoController from "../controllers/info.controller.js";
const router = express.Router();
// async function isAuthenticated(req, res, next) {
//   let token = req.headers.authorization?.split(" ")[1];
//   if (token) {
//     let user = await User.findOne({ accessToken: token });
//     if (user) {
//       req.isAuthenticated = () => true;
//       req.body.token = token;
//       req.body.user_status = user?.status; 
//     }
//   } 
//   if (req.isAuthenticated()) {
//     next(); 
//   } else {
//     res.status(401).json({ message: "Kimlik doğrulama gerekiyor" });
//   }
// }

// router.use(isAuthenticated);

router.get("/hospital-info", async (req, res) => {
  infoController.getHospitalInfo(req, res);
});
router.get("/hospital-info/:id", async (req, res) => {
  infoController.getHospitalInfoById(req, res);
});
router.post("/hospital-info", async (req, res) => {
  infoController.createHospitalInfo(req, res);
});

export default router;