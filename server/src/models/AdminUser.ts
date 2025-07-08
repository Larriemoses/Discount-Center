import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

// 1. Define an interface for our AdminUser document
export interface IAdminUser extends Document {
  username: string;
  password: string;
  role: "admin"; // <
  comparePassword: (candidatePassword: string) => Promise<boolean>; // Method to compare passwords
}

// 2. Define the AdminUser schema
const AdminUserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce a minimum password length
    },
    role: {
      // <--- Add this block!
      type: String,
      enum: ["admin"], // Define allowed roles
      default: "admin", // Default role for new users
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// 3. Pre-save hook to hash password before saving
AdminUserSchema.pre<IAdminUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Only hash if the password has been modified
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// 4. Method to compare password (for login)
AdminUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 5. Create and export the Mongoose model
export default mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
