import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

type Citation = {
  id: string;
  title: string;
  snippet: string;
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: Date;
};

const citationSchema = new Schema<Citation>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    snippet: { type: String, required: true }
  },
  { _id: false }
);

const messageSchema = new Schema<Message>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    citations: [citationSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const conversationSchema = new Schema(
  {
    messages: { type: [messageSchema], default: [] },
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export type Conversation = InferSchemaType<typeof conversationSchema>;
export type ConversationDocument = HydratedDocument<Conversation>;
export type ConversationMessage = Message;
export type ConversationCitation = Citation;

export const ConversationModel = model<Conversation>("Conversation", conversationSchema);
