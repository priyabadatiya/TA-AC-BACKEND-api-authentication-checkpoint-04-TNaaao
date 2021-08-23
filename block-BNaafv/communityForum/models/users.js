let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let Profile = require('../models/profile');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  email: { type: String, unique: true, require: true },
  username: { type: String, unique: true, require: true },
  password: { type: String, require: true },
  bio: { type: String, default: null },
  name: { type: String, default: null },
  image: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  profile: { type: mongoose.Types.ObjectId, ref: 'Profile' },
  questions: [{ type: mongoose.Types.ObjectId, ref: 'Question' }],
  answers: [{ type: mongoose.Types.ObjectId, ref: 'Answer' }],
  followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
});

userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);

    let data = {
      name: this.name,
      username: this.username,
      bio: this.bio,
      image: this.image,
      isAdmin: this.isAdmin,
      isBlocked: this.isBlocked,
    };
    createdProfile = await Profile.create(data);
    this.profile = createdProfile.id;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.createToken = async function () {
  try {
    let profile = await Profile.findById(this.profile);
    let payload = {
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      image: profile.image,
    };

    let user = await User.findOne({ username: profile.username });
    if (user.isAdmin) {
      payload.isAdmin = true;
    } else {
      payload.isAdmin = false;
    }
    let token1 = await jwt.sign(payload, 'thisissecret');

    return token1;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = async function (token) {
  let data = {
    email: this.email,
    username: this.username,
    token: token,
  };
  return data;
};

let User = mongoose.model('User', userSchema);
module.exports = User;
