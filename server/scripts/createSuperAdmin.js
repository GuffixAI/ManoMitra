import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model.js";
import { connectDB } from "../db/connectDB.js";

dotenv.config({ path: './server/.env' });

const createSuperAdmin = async () => {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Check if a super admin already exists
    const existingSuperAdmin = await Admin.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      console.log("✅ A super admin already exists. No action taken.");
      process.exit(0);
    }

    // 3. Get credentials from environment variables
    const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

    if (!SUPER_ADMIN_NAME || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.error("❌ Error: Please define SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD in your .env file.");
      process.exit(1);
    }

    // 4. Create the new super admin user
    const superAdmin = new Admin({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD, // The pre-save hook will hash this
      isSuperAdmin: true,
      permissions: [ // A super admin typically has all permissions
        "manage_users",
        "manage_counsellors",
        "manage_volunteers",
        "manage_reports",
        "view_analytics",
        "system_settings",
        "emergency_access",
      ],
    });

    await superAdmin.save();

    console.log("✅ Super admin created successfully!");
    console.log(`   - Name: ${superAdmin.name}`);
    console.log(`   - Email: ${superAdmin.email}`);

  } catch (error) {
    console.error("❌ Failed to create super admin:", error.message);
  } finally {
    // 5. Disconnect from the database
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

createSuperAdmin();