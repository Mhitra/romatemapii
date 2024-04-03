import hospital from "../models/hospital.js";


export const getHospitalInfo = async (req, res) => {
  try {
    const hospitalInfo = await hospital.find();
    res.status(200).json(hospitalInfo);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const getHospitalInfoById = async (req, res) => {
  const { id } = req.params;
  try {
    const hospitalInfo = await hospital.findById(id);
    res.status(200).json(hospitalInfo);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const createHospitalInfo = async (req, res) => {
  if(!req.body) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }
  const token = req.headers.authorization?.split(" ")[1];
  const user = await User.findOne({
    accessToken: token
  });
  if (!user) {
    return res.status(401).json({ message: "Kimlik doğrulama gerekiyor" });
  }
  if (user.status !== "1") {
    return res.status(401).json({ message: "Yetkiniz yok" });
  }
  const hospitalInfo = req.body;
  const newHospitalInfo = new hospital(hospitalInfo);
  try {
    await newHospitalInfo.save();
    res.status(201).json(newHospitalInfo);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}
