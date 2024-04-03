import express from 'express';
import * as BlogController from "../controllers/blog.controller.js";
const router = express.Router();
import User from "../models/user.js";
async function isAuthenticated(req, res, next) {
  const publicPaths = ["/","/:blogId"];
  let token = req.headers.authorization?.split(" ")[1];
  if (token) {
    let user = await User.findOne({ accessToken: token });
    if (user) {
      req.isAuthenticated = () => true;
      req.body.token = token;
      req.body.status = user?.status;
    }
  }
  if (publicPaths.includes(req.path) ||req.body.status =="1"|| req.isAuthenticated()) {
    next(); 
  } else {
    res.status(401).json({ message: "Kimlik doğrulama gerekiyor" });
  }
}

router.use(isAuthenticated);


router.post("/create", async (req, res) => {
  BlogController.createBlog(req, res);
});

router.get("/:blogId", async (req, res) => {
  BlogController.getBlog(req, res);
});

router.put("/:blogId", async (req, res) => {
  BlogController.updateBlog(req, res);
});

router.delete("/:blogId", async (req, res) => {
  BlogController.deleteBlog(req, res);
});

router.get("/", async (req, res) => {
  BlogController.getAllBlogs(req, res);
});

export default router;