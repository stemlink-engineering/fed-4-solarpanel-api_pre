import { Router } from "express";
import {
  getAllSolarUnits,
  getSolarUnitById,
  getSolarUnitsByUserId,
  createSolarUnit,
  updateSolarUnit,
  deleteSolarUnit,
  getSolarUnitsByStatus,
  updateSolarUnitStatus,
} from "../application/solar-unit";

const router = Router();

// Get all solar units
router.get("/", getAllSolarUnits);

// Get solar unit by ID
router.get("/:id", getSolarUnitById);

// Get solar units by user ID
router.get("/user/:userId", getSolarUnitsByUserId);

// Get solar units by status
router.get("/status/:status", getSolarUnitsByStatus);

// Create new solar unit
router.post("/", createSolarUnit);

// Update solar unit
router.put("/:id", updateSolarUnit);

// Update solar unit status only
router.patch("/:id/status", updateSolarUnitStatus);

// Delete solar unit
router.delete("/:id", deleteSolarUnit);

export default router; 