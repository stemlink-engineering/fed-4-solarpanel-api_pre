import "dotenv/config";
import connectDB from "./infrastructure/db";
import SolarUnit from "./infrastructure/schemas/SolarUnit";
import EnergyGenerationRecord from "./infrastructure/schemas/EnergyGenerationRecord";

// Helper function to generate realistic energy production based on time of day
const generateEnergyProduction = (hour: number, capacity: number): number => {
  // Solar panels produce energy roughly from 6 AM to 8 PM
  // Peak production around noon (12 PM)
  // Simulate a bell curve for energy production
  
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
  // Multiply by 2 because it's a 2-hour interval
  const energyProduced = capacity * productionFactor * randomFactor * 2;
  
  return Math.round(energyProduced);
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
    
    // Generate energy records for the last 7 days
    console.log("⚡ Generating energy records for the last 7 days...");
    
    const records = [];
    const now = new Date();
    
    // Generate records for 7 days, every 2 hours
    for (let day = 6; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour += 2) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        const energyProduced = generateEnergyProduction(hour, savedSolarUnit.capacity);
        
        const record = new EnergyGenerationRecord({
          solarUnitId: savedSolarUnit._id,
          timestamp: timestamp,
          energyProduced: energyProduced,
          intervalHours: 2
        });
        
        records.push(record);
      }
    }
    
    // Save all records at once
    await EnergyGenerationRecord.insertMany(records);
    console.log(`✅ Created ${records.length} energy generation records`);
    
    // Print summary
    console.log("\n📊 Seeding Summary:");
    console.log(`- Solar Unit: ${savedSolarUnit.serialNumber} (${savedSolarUnit.capacity}W)`);
    console.log(`- Energy Records: ${records.length} records (7 days, 2-hour intervals)`);
    console.log(`- Total Energy Generated: ${records.reduce((sum, record) => sum + record.energyProduced, 0)} Wh`);
    
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