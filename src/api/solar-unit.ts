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
  assignUserToSolarUnit,
  unassignUserFromSolarUnit,
  getUnassignedSolarUnits,
} from "../application/solar-unit";
import { isBackendAuthenticated } from "./middlewares/authentication-middleware";

const router = Router();

// Get all solar units
router.get("/", isBackendAuthenticated, getAllSolarUnits);

// Get solar unit by ID
router.get("/:id", isBackendAuthenticated, getSolarUnitById);

// Get solar units by user ID
router.get("/user/:userId", isBackendAuthenticated, getSolarUnitsByUserId);

// Get solar units by status
router.get("/status/:status", isBackendAuthenticated, getSolarUnitsByStatus);

// Get unassigned solar units
router.get("/unassigned/list", isBackendAuthenticated, getUnassignedSolarUnits);

// Create new solar unit
router.post("/", isBackendAuthenticated, createSolarUnit);

// Update solar unit
router.put("/:id", isBackendAuthenticated, updateSolarUnit);

// Update solar unit status only
router.patch("/:id/status", isBackendAuthenticated, updateSolarUnitStatus);

// Assign user to solar unit
router.patch("/:id/assign", isBackendAuthenticated, assignUserToSolarUnit);

// Unassign user from solar unit
router.patch("/:id/unassign", isBackendAuthenticated, unassignUserFromSolarUnit);

// Delete solar unit
router.delete("/:id", isBackendAuthenticated, deleteSolarUnit);

export default router; 