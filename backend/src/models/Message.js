import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imgeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: là loại index bao gồm nhiều trường, giúp tối ưu hóa các truy vấn phức tạp hơn.
// Trong trường hợp này, chúng ta tạo một compound index trên trường conversationId và createdAt.
// Trong mongoDB: giá trị 1 là sắp xếp theo thứ tự tăng dần (ascending),
// còn giá trị -1 là sắp xếp theo thứ tự giảm dần (descending).

// => Tạo ra 1 bản tra cứu, dữ liệu được sắp xếp theo conversationId trước theo thứ tự tăng dần,
// sau đó trong mỗi conversationId, dữ liệu được sắp xếp theo createdAt theo thứ tự giảm dần.
// Nhờ vậy mà tin nhắn mới nhất sẽ nằm ở trên cùng
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
