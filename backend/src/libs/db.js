import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('DB connected');
  } catch (error) {
    console.log('Error connect DB', error);
    process.exit(1); // dừng chương trình nếu không kết nối được tới DB
  }
};
