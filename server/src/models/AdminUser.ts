import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import crypto from "crypto"; // Import crypto for token generation

export interface IAdminUser extends Document {
  username: string;
  password?: string; // Password can be optional if you have social logins
  role: "admin";
  resetPasswordToken?: string; // New field for reset token
  resetPasswordExpire?: Date; // New field for token expiration
  comparePassword: (candidatePassword: string) => Promise<boolean>; // Method to compare passwords
  getResetPasswordToken: () => string; // New method to generate reset token
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
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["admin"], // Define allowed roles
      default: "admin", // Default role for new users
    },
    resetPasswordToken: String, // Stores the hashed reset token
    resetPasswordExpire: Date, // Stores the expiration date of the token
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// 3. Pre-save hook to hash password before saving
AdminUserSchema.pre<IAdminUser>("save", async function (next) {
  // Only hash if the password has been modified or is new
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password!, salt); // Hash the password
  next();
});

// 4. Method to compare password (for login)
AdminUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

// 5. Method to generate and hash password reset token
AdminUserSchema.methods.getResetPasswordToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token and set it to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expiration (e.g., 10 minutes from now)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return the unhashed token to be sent in the email
};

// 6. Create and export the Mongoose model
export default mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
