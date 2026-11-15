import Database from "./config/database";
import { User } from "./models/User";
import bcrypt from "bcryptjs";

const initDB = async () => {
  const db = Database.getInstance();
  await db.connect();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("Seeding database...");

  try {
    const adminEmail = "admin@email.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        username: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  console.log("Database initialization complete.");
  process.exit(0);
};

initDB();
