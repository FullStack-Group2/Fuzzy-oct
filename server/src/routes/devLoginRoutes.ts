// USE ONLY FOR DEVS, PLEASE NO PRODUCTION

import { Router } from "express";
import jwt from "jsonwebtoken";
import { ShipperModel } from "../models/Shipper";
import { UserRole } from "../models/UserRole";

const router = Router();
const { JWT_SECRET, NODE_ENV } = process.env;

router.post("/login-as/shipper/:id", async (req, res) => {
  if (NODE_ENV === "production") return res.status(403).json({ message: "Disabled in production" });
  try {
    if (!JWT_SECRET) return res.status(500).json({ message: "JWT secret missing" });

    const shipper = await ShipperModel.findById(req.params.id).select("_id username");
    if (!shipper) return res.status(404).json({ message: "Shipper not found" });

    const token = jwt.sign(
      { userId: String(shipper._id), username: shipper.username, role: UserRole.SHIPPER },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: "Failed to login-as shipper" });
  }
});

export default router;
