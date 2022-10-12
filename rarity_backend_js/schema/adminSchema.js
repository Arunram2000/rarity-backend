import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  cronRunning: { type: Boolean },
  showRecentCollections: { type: Boolean },
  showNewestCollections: { type: Boolean },
  headerMenu: { type: Boolean },
});

const Admin = mongoose.model("admin", adminSchema);

export default Admin;
