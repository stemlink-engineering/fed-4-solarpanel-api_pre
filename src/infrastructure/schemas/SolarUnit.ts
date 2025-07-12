import mongoose from "mongoose";

const solarUnitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  installationDate: {
    type: Date,
  },
  capacity: {
    type: Number, // in watts
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "MAINTENANCE", "FAULT"],
    default: "INACTIVE",
  },
});

const SolarUnit = mongoose.model("SolarUnit", solarUnitSchema);

export default SolarUnit;
