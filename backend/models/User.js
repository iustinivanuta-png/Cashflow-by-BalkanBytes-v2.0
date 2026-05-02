const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, default: "" },

        provider: {
            type: String,
            enum: ["local", "google", "facebook"],
            default: "local",
        },

        providerId: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);