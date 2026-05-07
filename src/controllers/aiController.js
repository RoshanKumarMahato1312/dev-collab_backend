"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = exports.explainCode = void 0;
const zod_1 = require("zod");
const env_1 = require("../config/env");
const explainSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    language: zod_1.z.string().min(1)
});
const generateSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(3),
    language: zod_1.z.string().min(1)
});
const CANDIDATE_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768"
];
const requestGroq = async (systemPrompt, userPrompt) => {
    var _a, _b, _c, _d, _e;
    let lastError = "Unknown Groq error";
    let lastStatus = 502;
    for (const model of CANDIDATE_MODELS) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env_1.env.groqApiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                temperature: 0.2
            })
        });
        if (response.ok) {
            const data = (await response.json());
            return (_e = (_d = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "";
        }
        const errorText = await response.text();
        lastStatus = response.status;
        lastError = errorText;
        const modelNotFound = (response.status === 400 || response.status === 404) &&
            (errorText.toLowerCase().includes("model") || errorText.toLowerCase().includes("not found") || errorText.toLowerCase().includes("does not exist"));
        if (!modelNotFound) {
            break;
        }
    }
    const mappedStatus = [400, 401, 403, 404, 429].includes(lastStatus) ? lastStatus : 502;
    throw { status: mappedStatus, error: lastError };
};
const explainCode = async (req, res) => {
    var _a, _b, _c;
    try {
        const body = explainSchema.parse(req.body);
        if (!env_1.env.groqApiKey) {
            res.status(400).json({ message: "GROQ_API_KEY is missing in server environment" });
            return;
        }
        const explanation = await requestGroq("You explain code clearly and concisely for developers.", `Explain this ${body.language} code in simple terms and include key improvements:\n\n${body.code}`);
        res.json({ explanation: explanation || "No explanation generated" });
    }
    catch (error) {
        console.error("Groq explain failed:", (_a = error === null || error === void 0 ? void 0 : error.error) !== null && _a !== void 0 ? _a : error);
        res.status((_b = error === null || error === void 0 ? void 0 : error.status) !== null && _b !== void 0 ? _b : 502).json({
            message: "Groq request failed",
            error: (_c = error === null || error === void 0 ? void 0 : error.error) !== null && _c !== void 0 ? _c : "Unknown Groq error"
        });
    }
};
exports.explainCode = explainCode;
const generateCode = async (req, res) => {
    var _a, _b, _c;
    try {
        const body = generateSchema.parse(req.body);
        if (!env_1.env.groqApiKey) {
            res.status(400).json({ message: "GROQ_API_KEY is missing in server environment" });
            return;
        }
        const code = await requestGroq("You write production-quality code. Return only code without markdown fences, no explanation text.", `Write ${body.language} code for this request:\n${body.prompt}`);
        res.json({ code: code !== null && code !== void 0 ? code : "" });
    }
    catch (error) {
        console.error("Groq generate failed:", (_a = error === null || error === void 0 ? void 0 : error.error) !== null && _a !== void 0 ? _a : error);
        res.status((_b = error === null || error === void 0 ? void 0 : error.status) !== null && _b !== void 0 ? _b : 502).json({
            message: "Groq request failed",
            error: (_c = error === null || error === void 0 ? void 0 : error.error) !== null && _c !== void 0 ? _c : "Unknown Groq error"
        });
    }
};
exports.generateCode = generateCode;
