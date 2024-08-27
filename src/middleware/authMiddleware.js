"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidated = void 0;
const client_1 = __importDefault(require("../rabbitMQ/client"));
const enum_1 = require("../utils/constants/enum");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.isValidated = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    try {
        const response = yield client_1.default.produce({ token }, "is-authenticated");
        const result = JSON.parse(response.content.toString());
        if (!result || !result.userId) {
            res
                .status(enum_1.statusCode.Unauthorized)
                .json({ success: false, message: "Unauthorized" });
            return;
        }
        req.userId = result.userId;
        req.role = result.role;
        next();
    }
    catch (err) {
        res
            .status(enum_1.statusCode.Unauthorized)
            .json({ success: false, message: err.message });
    }
}));
