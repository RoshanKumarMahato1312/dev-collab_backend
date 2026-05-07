"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = void 0;
const User_1 = require("../models/User");
const searchUsers = async (req, res) => {
    var _a;
    const query = (_a = req.query.query) === null || _a === void 0 ? void 0 : _a.trim();
    if (!query) {
        res.json({ users: [] });
        return;
    }
    const users = await User_1.User.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
        ]
    })
        .select("_id name email")
        .limit(10);
    res.json({ users });
};
exports.searchUsers = searchUsers;
