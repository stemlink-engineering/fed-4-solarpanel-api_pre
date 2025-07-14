import { Router } from "express";
import {
  createEnergyGenerationRecord,
  getEnergyRecordsBySolarUnit,
  getEnergyRecordsByDateRange,
  getEnergyRecordById,
  updateEnergyGenerationRecord,
  deleteEnergyGenerationRecord,
  getLatestEnergyRecord,
} from "../application/energy-generation-record";
import { isBackendAuthenticated } from "./middlewares/authentication-middleware";

const router = Router();

// Create new energy generation record
router.post("/", isBackendAuthenticated, createEnergyGenerationRecord);

// Get energy record by ID
router.get("/:id", isBackendAuthenticated, getEnergyRecordById);

// Update energy generation record
router.put("/:id", isBackendAuthenticated, updateEnergyGenerationRecord);

// Delete energy generation record
router.delete("/:id", isBackendAuthenticated, deleteEnergyGenerationRecord);

// Get energy records by solar unit with pagination
router.get("/solar-unit/:solarUnitId", isBackendAuthenticated, getEnergyRecordsBySolarUnit);

// Get latest energy record for a solar unit
router.get("/solar-unit/:solarUnitId/latest", isBackendAuthenticated, getLatestEnergyRecord);

// Get energy records by date range for a specific solar unit
router.get("/solar-unit/:solarUnitId/date-range", isBackendAuthenticated, getEnergyRecordsByDateRange);

export default router; 