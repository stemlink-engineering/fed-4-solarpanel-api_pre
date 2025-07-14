import "dotenv/config";
import connectDB from "./infrastructure/db";
import SolarUnit from "./infrastructure/schemas/SolarUnit";
import EnergyGenerationRecord from "./infrastructure/schemas/EnergyGenerationRecord";

// Anomaly types for tracking
interface AnomalyRecord {
  type: string;
  timestamp: Date;
  description: string;
}

const anomalies: AnomalyRecord[] = [];

// Anomaly tracking to ensure min/max counts
const anomalyCounts = {
  NIGHT_GENERATION: 0,
  SUDDEN_DROP: 0,
  OVERPRODUCTION: 0,
  PEAK_HOUR_ZERO: 0,
  IRREGULAR_SPIKE: 0
};

const MIN_ANOMALIES_PER_TYPE = 5;
const MAX_ANOMALIES_PER_TYPE = 20;

// Helper function to determine if we should force an anomaly
const shouldForceAnomaly = (totalRecords: number, currentRecord: number): boolean => {
  const progress = currentRecord / totalRecords;
  
  // Check if any anomaly type is below minimum
  const typesNeedingMore = Object.entries(anomalyCounts).filter(
    ([_, count]) => count < MIN_ANOMALIES_PER_TYPE
  ).length;
  
  // Force anomalies more aggressively if we're past 70% and still need more
  if (progress > 0.7 && typesNeedingMore > 0) {
    return Math.random() < 0.3; // 30% chance
  }
  
  // Normal anomaly rate
  return Math.random() < 0.08; // 8% chance
};

// Helper function to select anomaly type based on current counts
const selectAnomalyType = (): string | null => {
  // Get types that haven't reached maximum
  const availableTypes = Object.entries(anomalyCounts)
    .filter(([_, count]) => count < MAX_ANOMALIES_PER_TYPE)
    .map(([type]) => type);
  
  if (availableTypes.length === 0) return null;
  
  // Prioritize types that haven't reached minimum
  const typesNeedingMore = availableTypes.filter(
    type => anomalyCounts[type as keyof typeof anomalyCounts] < MIN_ANOMALIES_PER_TYPE
  );
  
  // If some types need more, prefer them
  if (typesNeedingMore.length > 0) {
    return typesNeedingMore[Math.floor(Math.random() * typesNeedingMore.length)];
  }
  
  // Otherwise, random selection from available types
  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
};

// Helper function to generate realistic energy production based on time of day
const generateEnergyProduction = (hour: number, capacity: number, timestamp: Date, previousEnergy: number = 0, totalRecords: number = 1000, currentRecord: number = 0): number => {
  // Normal production calculation
  const normalProduction = () => {
    if (hour < 6 || hour > 20) {
      return 0; // No production during night
    }
    
    // Calculate energy production as a percentage of capacity
    // Using a sine wave to simulate solar production curve
    const dayStart = 6;
    const dayEnd = 20;
    const dayLength = dayEnd - dayStart;
    const normalizedHour = (hour - dayStart) / dayLength;
    
    // Sin curve from 0 to π gives us a nice bell curve
    const productionFactor = Math.sin(normalizedHour * Math.PI);
    
    // Add some randomness (±20%) to make it more realistic
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    // Energy produced in watt-hours for 2-hour interval
    const energyProduced = capacity * productionFactor * randomFactor * 2;
    
    return Math.round(energyProduced);
  };
  
  // Check if we should generate an anomaly
  const shouldAnomaly = shouldForceAnomaly(totalRecords, currentRecord);
  if (!shouldAnomaly) {
    return normalProduction();
  }
  
  // Select anomaly type
  const anomalyType = selectAnomalyType();
  if (!anomalyType) {
    return normalProduction();
  }
  
  // Generate specific anomaly
  switch (anomalyType) {
    case "NIGHT_GENERATION":
      if (hour < 6 || hour > 20) {
        const nightEnergy = Math.round(capacity * 0.1 * Math.random()); // 0-10% of capacity
        anomalies.push({
          type: "NIGHT_GENERATION",
          timestamp,
          description: `Generated ${nightEnergy}Wh during night hours (${hour}:00)`
        });
        anomalyCounts.NIGHT_GENERATION++;
        return nightEnergy;
      }
      return normalProduction();
      
    case "SUDDEN_DROP":
      if (previousEnergy > 0 && (hour >= 8 && hour <= 18)) {
        const droppedEnergy = Math.round(previousEnergy * 0.1); // 90% drop
        anomalies.push({
          type: "SUDDEN_DROP",
          timestamp,
          description: `Sudden drop from ${previousEnergy}Wh to ${droppedEnergy}Wh (${Math.round((1 - droppedEnergy/previousEnergy) * 100)}% decrease)`
        });
        anomalyCounts.SUDDEN_DROP++;
        return droppedEnergy;
      }
      return normalProduction();
      
    case "OVERPRODUCTION":
      if (hour >= 10 && hour <= 14) { // Peak hours
        const overEnergy = Math.round(capacity * 2.8 * Math.random() + capacity * 1.2); // 120-400% of capacity
        anomalies.push({
          type: "OVERPRODUCTION",
          timestamp,
          description: `Overproduction: ${overEnergy}Wh (${Math.round((overEnergy/capacity) * 100)}% of rated capacity)`
        });
        anomalyCounts.OVERPRODUCTION++;
        return overEnergy;
      }
      return normalProduction();
      
    case "PEAK_HOUR_ZERO":
      if (hour >= 10 && hour <= 14) {
        anomalies.push({
          type: "PEAK_HOUR_ZERO",
          timestamp,
          description: `Zero output during peak hours (${hour}:00)`
        });
        anomalyCounts.PEAK_HOUR_ZERO++;
        return 0;
      }
      return normalProduction();
      
    case "IRREGULAR_SPIKE":
      if (hour >= 7 && hour <= 17) {
        const normal = normalProduction();
        const spikeEnergy = Math.round(normal * (3 + Math.random() * 2)); // 300-500% spike
        anomalies.push({
          type: "IRREGULAR_SPIKE",
          timestamp,
          description: `Irregular spike: ${spikeEnergy}Wh (${Math.round((spikeEnergy/normal) * 100)}% of normal output)`
        });
        anomalyCounts.IRREGULAR_SPIKE++;
        return spikeEnergy;
      }
      return normalProduction();
      
    default:
      return normalProduction();
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Clearing existing data...");
    await EnergyGenerationRecord.deleteMany({});
    await SolarUnit.deleteMany({});
    
    // Reset anomaly counts
    Object.keys(anomalyCounts).forEach(key => {
      anomalyCounts[key as keyof typeof anomalyCounts] = 0;
    });
    anomalies.length = 0;
    
    // Create a solar unit
    console.log("🌞 Creating solar unit...");
    const solarUnit = new SolarUnit({
      serialNumber: "SU-2024-001",
      installationDate: new Date("2024-01-15"),
      capacity: 5000, // 5kW capacity
      status: "ACTIVE",
      userId: "user_test123" // Optional test user ID
    });
    
    const savedSolarUnit = await solarUnit.save();
    console.log(`✅ Solar unit created with ID: ${savedSolarUnit._id}`);
    
    // Generate energy records from June 1st to current date
    const startDate = new Date(2025, 5, 1); // June 1st, 2025 (month is 0-indexed)
    const now = new Date();
    const daysDifference = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`⚡ Generating energy records from June 1st, 2025 to ${now.toDateString()} (${daysDifference + 1} days)...`);
    
    const records = [];
    let previousEnergy = 0;
    
    // Calculate total expected records for anomaly planning
    const totalExpectedRecords = (daysDifference + 1) * 12; // 12 records per day (every 2 hours)
    let currentRecordIndex = 0;
    
    // Generate records from June 1st to current date, every 2 hours
    for (let day = 0; day <= daysDifference; day++) {
      for (let hour = 0; hour < 24; hour += 2) {
        const timestamp = new Date(startDate);
        timestamp.setDate(startDate.getDate() + day);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Don't generate future records
        if (timestamp > now) {
          break;
        }
        
        const energyProduced = generateEnergyProduction(
          hour, 
          savedSolarUnit.capacity, 
          timestamp, 
          previousEnergy,
          totalExpectedRecords,
          currentRecordIndex
        );
        
        const record = new EnergyGenerationRecord({
          solarUnitId: savedSolarUnit._id,
          timestamp: timestamp,
          energyProduced: energyProduced,
          intervalHours: 2
        });
        
        records.push(record);
        currentRecordIndex++;
        
        // Update previous energy for sudden drop detection
        if (energyProduced > 0) {
          previousEnergy = energyProduced;
        }
      }
      
      // Break if we've reached current date
      if (day === daysDifference) {
        break;
      }
    }
    
    // Save all records at once
    await EnergyGenerationRecord.insertMany(records);
    console.log(`✅ Created ${records.length} energy generation records`);
    
    // Print summary
    console.log("\n📊 Seeding Summary:");
    console.log(`- Solar Unit: ${savedSolarUnit.serialNumber} (${savedSolarUnit.capacity}W)`);
    console.log(`- Date Range: June 1st, 2025 to ${now.toDateString()}`);
    console.log(`- Energy Records: ${records.length} records (${daysDifference + 1} days, 2-hour intervals)`);
    console.log(`- Total Energy Generated: ${records.reduce((sum, record) => sum + record.energyProduced, 0)} Wh`);
    
    // Print anomaly summary
    if (anomalies.length > 0) {
      console.log("\n🚨 Anomalies Generated:");
      Object.entries(anomalyCounts).forEach(([type, count]) => {
        const status = count >= MIN_ANOMALIES_PER_TYPE ? "✅" : "❌";
        console.log(`- ${type}: ${count} occurrences ${status} (min: ${MIN_ANOMALIES_PER_TYPE}, max: ${MAX_ANOMALIES_PER_TYPE})`);
      });
      
      console.log(`\n📊 Total Anomalies: ${anomalies.length}`);
      
      console.log(`\n📋 Detailed Anomaly Log:`);
      anomalies.forEach((anomaly, index) => {
        console.log(`${index + 1}. [${anomaly.type}] ${anomaly.timestamp.toISOString().split('T')[0]} ${anomaly.timestamp.getHours()}:00 - ${anomaly.description}`);
      });
    }
    
    console.log("\n🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
};

// Run the seed function
seedDatabase(); 