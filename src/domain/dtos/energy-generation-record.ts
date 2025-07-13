import { z } from "zod";

export const CreateEnergyGenerationRecordDTO = z.object({
  solarUnitId: z.string().min(1, "Solar unit ID is required"),
  timestamp: z.string().transform((str) => new Date(str)).optional(),
  energyProduced: z.number().min(0, "Energy produced must be non-negative"),
  intervalHours: z.number().min(0.1).max(24, "Interval must be between 0.1 and 24 hours").optional(),
});

export const UpdateEnergyGenerationRecordDTO = z.object({
  timestamp: z.string().transform((str) => new Date(str)).optional(),
  energyProduced: z.number().min(0, "Energy produced must be non-negative").optional(),
  intervalHours: z.number().min(0.1).max(24, "Interval must be between 0.1 and 24 hours").optional(),
});

export const GetEnergyRecordsByDateRangeDTO = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  solarUnitId: z.string().optional(),
});

export type CreateEnergyGenerationRecordType = z.infer<typeof CreateEnergyGenerationRecordDTO>;
export type UpdateEnergyGenerationRecordType = z.infer<typeof UpdateEnergyGenerationRecordDTO>;
export type GetEnergyRecordsByDateRangeType = z.infer<typeof GetEnergyRecordsByDateRangeDTO>; 