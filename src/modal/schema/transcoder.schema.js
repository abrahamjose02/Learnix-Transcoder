"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const transcoder_entities_1 = require("../transcoder.entities");
const transcoderSchema = new mongoose_1.default.Schema({
    fileName: {
        type: String,
    },
    generatedName: {
        type: String,
    },
    status: {
        type: String,
        enum: [
            transcoder_entities_1.Status.transcoding,
            transcoder_entities_1.Status.completed,
            transcoder_entities_1.Status.subtitle,
            transcoder_entities_1.Status.completed,
            transcoder_entities_1.Status.error,
            transcoder_entities_1.Status.finishing,
        ],
        default: transcoder_entities_1.Status.transcoding,
    },
    videoUrl: {
        type: String,
    },
    subtitleUrl: {
        type: String,
    },
    instructorId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const TranscoderModel = mongoose_1.default.model("Transcoder", transcoderSchema);
exports.default = TranscoderModel;
