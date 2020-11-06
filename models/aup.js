const mongoose = require("mongoose");

const AupSchema = new mongoose.Schema({
  aupName: { type: String, required: true },
  createdBy: { type: String, required: true },
  gmailToken: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  },
  gmail_trigger_content: { type: String },
  slack_info: {
    userid: { type: String },
    user_access_token: { type: String },
    user_workspace_id: { type: String },
    user_channel_id: [{ type: String }]
  }
});

module.exports = mongoose.model("Aup", AupSchema);
