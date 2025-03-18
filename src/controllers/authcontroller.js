import admin from "../config/firebaseConfig.js";
import { getUserById, createUser, createSession } from "../models/usermodel.js"
export const verifyFirebaseToken = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify Firebase JWT
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const userId = decodedToken.uid;
    const phone = decodedToken.phone_number;

    let user;
    try {
      user = await getUserById(userId);
    } catch {
      user = await createUser(userId, phone);
    }

    // Generate Supabase session
    const session = await createSession(user.id);

    res.json({ success: true, session });
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    res.status(401).json({ success: false, error: "Invalid Firebase token" });
  }
};
