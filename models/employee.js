const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const validator = require("validator");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [8, "Name must be grater 8 characters"],
    required: [true, "Name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [8, "password must be greater than 8 character"],
    select: false,
  },
  passConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Pasword does not match",
    },
  },
  role: {
    type: String,
    enum: ["manager", "developer", "design", "scrum", "master"],
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    enum: ["employed", "fired"],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passConfirm = undefined;
  next();
});

employeeSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

employeeSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

employeeSchema.methods.correctPassword = async function (
  candidatePassword,
  employeePassword
) {
  return await bcrypt.compare(candidatePassword, employeePassword);
};
employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

employeeSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const employee = mongoose.model("Employee", employeeSchema);

module.exports = employee;
