import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

// Chuẩn hóa dữ liệu trước khi lưu vào DB.
// Sắp xếp dữ liệu để tối ưu truy vấn chỉ cần kiểm tra 1 chiều

// Đoạn này chạy trước khi lưu dữ liệu vào DB
friendSchema.pre('save', function () {
  const a = this.userA.toString();
  const b = this.userB.toString();

  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }
});

friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
