import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import UserRoutes from "./app/routes/user.routes.js";
import ExerciseRoutes from "./app/routes/exercises.routes.js";
import cron from "node-cron";
import User from "./app/models/user.js";
import PatientExercises from "./app/models/PatientExercises.js";
import Exercises from "./app/models/Exercises.js";
import inforoutes from "./app/routes/info.routes.js";
import axios from "axios";




dotenv.config();
const app = express(); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const connectWithRetry = () => {
  mongoose.connect(
    process.env.MONGODB_URI
    , { useNewUrlParser: true, useUnifiedTopology: true, dbName: "romatem"})
    .then(() => console.log("Veritabanına başarıyla bağlandı!"))
    .catch((err) => {
      console.error("Veritabanına bağlanırken hata oluştu: " + err);
      console.log("5 saniye sonra tekrar denenecek...");
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();


cron.schedule('0 9 * * *', async() => {
  const exercises = await PatientExercises.find();
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
if(hasExercisesToday){
  const exerciseIds = filteredExercises.map(exercise => exercise.ExerciseID);
  const exerciseList = await Promise.all(exerciseIds.map(id => Exercises.findById(id)));
  console.log(exerciseList);
  for (let i = 0; i < exerciseList.data.length; i++) {
    const user = await User.findOne({ _id: exerciseList.data[i].PatientID });
    if (user) {
      await sendPushNotification({
        expoPushToken: user.expoPushToken,
        number: exerciseList.data[i].number,
      });
    }
  }
  console.log("Günlük egzersizler kontrol edildi.");
}
  async function sendPushNotification({
    expoPushToken , number
  }) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Egzersiz Zamanı!',
      body: `Bugün ${number} tane egzersiziniz var. `,
    };
    await axios.post('https://exp.host/--/api/v2/push/send', JSON.stringify(message), {
      
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    }
        );
   
  }
});



app.use(session({
  secret: crypto.randomBytes(64).toString("hex"),
  resave: false,
  saveUninitialized: false,
cookie: { name: "myCookie", maxAge: 3600000, secure: true, httpOnly: true, sameSite: "strict" }}));

app.use(passport.initialize());
app.use(passport.session());
app.get("/api/test", (req, res) => {
  res.json({ message: "Test is successful!" });
});

app.use("/api/user", UserRoutes);
app.use("/api/exercises", ExerciseRoutes);
app.use("/api/info", inforoutes);

app.listen(9000, () => console.log(`Sunucu 9000 portunda çalışıyor.`));