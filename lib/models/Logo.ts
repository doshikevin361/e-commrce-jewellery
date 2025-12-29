import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: 'Website Logo',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 150,
    },
    height: {
      type: Number,
      default: 50,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema);

export default Logo;
