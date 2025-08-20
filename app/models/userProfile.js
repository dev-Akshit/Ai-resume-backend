import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    middleName: String,
    lastName: {
        type: String,
        required: true,
    },
    currentOrganization: {
        type: String,
        required: true,
    },
    currentTitle: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    currentCity: {
        type: String,
        required: true,
    },
    currentArea: {
        type: String,
        required: true,
    },
    twitterHandle: String,
    instagramProfile: String,
    linkedinProfile: String,
    otherSocialHandles: String,
    briefIntroduction: String,
    inspiringQuote: String,
    joySource: String,
    contentLinks: [String],
    profilePhoto: {
        type: String,
        // required: true,
    },
    profileStatus: {
        type: Number,
        default: 0,
    },

    videos: [
        {
            type: {
                type: String,
                enum: ["earlyLife", "professionalLife", "currentLife"],
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            extractedData: {
                type: Object,
                required: true,
            },
        },
    ],
}, { timestamps: true });

const model = mongoose.model("UserProfile", schema);
export default model;
