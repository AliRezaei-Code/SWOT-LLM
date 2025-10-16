import { Schema, model } from "mongoose";

const templateSchema = new Schema(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    sections: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        prompt: { type: String, required: true },
        required: { type: Boolean, default: true }
      }
    ],
    metadata: { type: Map, of: String }
  },
  {
    timestamps: true
  }
);

templateSchema.index({ name: 1, version: 1 }, { unique: true });

export const TemplateModel = model("Template", templateSchema);
