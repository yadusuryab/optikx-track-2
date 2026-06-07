import mongoose from 'mongoose';

const ExtractedDataSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  trackingId: { type: String, default: '' },   // ← NEW
  otherText: { type: String, default: '' },
  rawText: { type: String, default: '' },
});

const ImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  extractedData: {
    type: ExtractedDataSchema,
    required: true,
    default: () => ({}),
  },
  documentType: { type: String, default: 'general' },
  tags: [{ type: String }],
  uploadedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

ImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ImageSchema.index({
  title: 'text',
  description: 'text',
  'extractedData.rawText': 'text',
  'extractedData.name': 'text',
  'extractedData.phoneNumber': 'text',
  'extractedData.address': 'text',
  'extractedData.trackingId': 'text',   // ← NEW
  tags: 'text',
});

ImageSchema.pre('save', function (next) {
  if (this.isNew) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);