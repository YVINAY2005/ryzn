import mongoose from 'mongoose';

const UIVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  userMessage: { type: String, required: true },
  plan: { type: Object, required: true },
  code: { type: String, required: true },
  explanation: { type: String, required: true },
  thinking: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const UIVersion = mongoose.model('UIVersion', UIVersionSchema);
export default UIVersion;
