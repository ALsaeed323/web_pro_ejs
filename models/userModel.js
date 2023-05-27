import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    shippingAddress: {
      fullName: { type: String, required: false },
      address: { type: String, required: false },
      city: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false },
    },
    paymentMethod: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function(next) {
  const user = this;
  if (!user.isModified('password')) return next();  
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  const user = this;
  bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
    if (err) return cb(err);
    if (isMatch) {
      console.log("Sign-in successful. Password matches!");
      console.log("done");
      cb(null, isMatch);
    } else {
      console.log("Sign-in failed. Password does not match!");
      cb(null, false);
    }
  });
};


const User = mongoose.model("User", userSchema);

export default User;
