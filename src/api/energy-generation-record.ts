import { Router } from "express";
import {
  createEnergyGenerationRecord,
  getEnergyRecordsBySolarUnit,
  getEnergyRecordsByDateRange,
  getEnergyRecordById,
  updateEnergyGenerationRecord,
  deleteEnergyGenerationRecord,
  getLatestEnergyRecord,
  getEnergyAnalytics,
  getTotalEnergyProduced,
} from "../application/energy-generation-record";

const router = Router();

// Create new energy generation record
router.post("/", createEnergyGenerationRecord);

// Get energy record by ID
router.get("/:id", getEnergyRecordById);

// Update energy generation record
router.put("/:id", updateEnergyGenerationRecord);

// Delete energy generation record
router.delete("/:id", deleteEnergyGenerationRecord);

// Get energy records by solar unit with pagination
router.get("/solar-unit/:solarUnitId", getEnergyRecordsBySolarUnit);

// Get latest energy record for a solar unit
router.get("/solar-unit/:solarUnitId/latest", getLatestEnergyRecord);

// Get total energy produced for a solar unit
router.get("/solar-unit/:solarUnitId/total", getTotalEnergyProduced);

// Get energy analytics (daily/weekly/monthly aggregation)
router.get("/solar-unit/:solarUnitId/analytics", getEnergyAnalytics);

// Get energy records by date range
router.get("/date-range", getEnergyRecordsByDateRange);

export default router; 