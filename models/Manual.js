const mongoose = require('mongoose');

const { Schema } = mongoose;

const manualSchema = new Schema(
  {
    name: { type: String, required: true, index: { unique: true } },
    url: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);

mongoose.model('manuals', manualSchema);
