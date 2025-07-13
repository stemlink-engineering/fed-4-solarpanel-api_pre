import mongoose from "mongoose";

const energyGenerationRecordSchema = new mongoose.Schema({
  solarUnitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolarUnit', // Proper reference to SolarUnit model
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Set to current timestamp when created
  },
  energyProduced: {
    type: Number, // in watt-hours (Wh)
    required: true,
    min: 0, // Energy can't be negative
  },
  intervalHours: {
    type: Number, // Duration of measurement period in hours
    default: 2, // Default to 2-hour intervals as discussed
    min: 0.1, // Minimum 6-minute intervals
    max: 24, // Maximum 24-hour intervals
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

const EnergyGenerationRecord = mongoose.model(
  "EnergyGenerationRecord",
  energyGenerationRecordSchema
);

export default EnergyGenerationRecord;