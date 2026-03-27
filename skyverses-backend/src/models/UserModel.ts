import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string; // full name — bạn có thể bỏ nếu dùng fistName + lastName
  firstName?: string;
  lastName?: string;

  gender?: string;
  birthYear?: number;
  province?: string;
  fxlabAccessToken?: string;
  geminiApiKey?: string;
  fxlabAccessTokenExpires: Date | null;

  phone?: string;
  specialty?: string; // lĩnh vực chuyên môn
  experienceYears?: number; // số năm kinh nghiệm
  careerDescription?: string;

  // Banking
  bankAccountName?: string;
  bankName?: string;
  bankNumber?: string;

  avatar?: string;
  googleId?: Types.ObjectId;

  plan: string;
  planExpiresAt: Date | null;

  refundedAt: Date;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  lastTextToVideoAt: Date;

  inviteCode: string;
  inviteFrom?: Types.ObjectId;

  role: "admin" | "master" | "sub" | "user";
  maxVideo: number;
  videoUsed: number;
  refunded: boolean;
  affiliateTotal: number;
  affiliatePending: number;
  pendingShopPayment?: {
    itemId: string;
    note: string;
    amount: number;
    expiresAt: Date;
    createdAt: Date;
  };

  ownedTools: string[];

  credit: number;
  creditBalance: number;
  claimWelcomeCredit: boolean;
  lastDailyClaimAt?: Date | null;
  fxflowOwner?: string; // sticky owner cho FXFlow jobs

  onboarding?: {
    role?:
      | "creative_director"
      | "growth_marketer"
      | "ai_architect"
      | "studio_founder";

    goals?: Array<
      | "ai_image"
      | "ai_video"
      | "game_assets"
      | "prompt_workflow"
      | "full_pipeline"
    >;

    workStyle?: "solo" | "small_team" | "studio" | "hybrid";

    experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";

    completedAt?: Date;
  };
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    // ----------- BASIC INFO -----------
    email: { type: String, unique: true, required: true },
    password: { type: String, default: null },
    name: { type: String, default: "" },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    birthYear: { type: Number, default: null },

    province: { type: String, default: "" },

    phone: { type: String, default: "" },

    specialty: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    careerDescription: { type: String, default: "" },

    // ----------- BANKING INFO -----------
    bankAccountName: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankNumber: { type: String, default: "" },

    avatar: { type: String },
    googleId: { type: mongoose.Schema.Types.ObjectId, ref: "GoogleToken" },

    // ----------- PLAN -----------
    plan: { type: String, default: null },
    planExpiresAt: { type: Date, default: null },
    videoCount: { type: Number, default: 0 },

    lastTextToVideoAt: { type: Date },

    // ----------- INVITE -----------
    inviteCode: { type: String, unique: true, required: true },
    inviteFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ----------- ROLE -----------
    role: {
      type: String,
      enum: ["admin", "master", "sub", "user"],
      default: "user",
    },

    lastActiveAt: { type: Date, default: null },
    maxVideo: { type: Number, default: 0 },
    videoUsed: { type: Number, default: 0 },
    affiliateTotal: { type: Number, default: 0 },
    affiliatePending: { type: Number, default: 0 },
    refunded: { type: Boolean, default: false },
    refundedAt: { type: Date },
    geminiApiKey: { type: String },
    fxlabAccessToken: { type: String },
    fxlabAccessTokenExpires: { type: Date },

    pendingShopPayment: {
      itemId: String,
      note: String,
      amount: Number,
      expiresAt: Date,
      createdAt: Date,
    },

    ownedTools: {
      type: [String],
      default: [],
    },
    credit: { type: Number, default: 0 },
    creditBalance: { type: Number, default: 0 },

    // UserModel.ts
    claimWelcomeCredit: {
      type: Boolean,
      default: false,
    },
    lastDailyClaimAt: {
      type: Date,
      default: null,
    },
    fxflowOwner: {
      type: String,
      default: null,
    },
    onboarding: {
      role: {
        type: String,
        enum: [
          "creative_director",
          "growth_marketer",
          "ai_architect",
          "studio_founder",
        ],
        default: null,
      },
    
      goals: {
        type: [String],
        enum: [
          "ai_image",
          "ai_video",
          "game_assets",
          "prompt_workflow",
          "full_pipeline",
        ],
        default: [],
      },

      workStyle: {
        type: String,
        enum: ["solo", "small_team", "studio", "hybrid"],
        default: null,
      },

      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
