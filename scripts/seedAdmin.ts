import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../src/models/Admin";

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri || !email || !password) {
    console.error(
      "MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD must all be set in .env.local before seeding."
    );
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin ${email} already exists - updating password.`);
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ email: email.toLowerCase(), passwordHash, name: "Mandal Admin" });
    console.log(`Created admin user: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
