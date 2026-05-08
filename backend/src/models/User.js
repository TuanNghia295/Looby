import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      trim: true,
      lowerase: true,
    },

    hashedPassword: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowerase: true,
      trim: true,
    },
    displayName: {
      type: String,
      require: true,
      trim: true,
    },
    avaterUrl: {
      type: String, // Link CDN to show
    },
    avatarId: {
      type: String, // Cloudinary public id to delete image
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    phone: {
      type: String,
      sparse: true, // allow null, but can not duplicate
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
