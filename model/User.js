import dotenv from "dotenv";
import validator from "validator";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name must be provided"],
    maxlength: 20,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, "Email must be provided"],
    validate: {
      message: "Please provide valid email",
      validator: validator.isEmail,
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password must be provided"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  // console.log(this.modifiedPath())
  // while using "user.save()" in "userController.js/updateUser" it triggers
  // this function and generates new password. And if we modify "password" we
  // should do return and "password" won't mofidy and we won't get an error
  // that's why we check here ↓ or use "findOneAndUpdate()" in "updateUser"
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
