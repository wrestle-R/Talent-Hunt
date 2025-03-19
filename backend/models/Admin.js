const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    firebaseUID: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "admin" },
    organization: {type: String, required: true}
});

module.exports = mongoose.model("Admin", adminSchema);
