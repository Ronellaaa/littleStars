import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function sign(user) {
  const payload = { sub: String(user._id), email: user.email, role: user.role };
  const secret = process.env.JWT_SECRET || "dev-secret";
  // 7d token; adjust as you like
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function signup(req, res) {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role)
      return res
        .status(400)
        .json({ message: "email, password, role required" });
    if (!["parent", "mentor"].includes(role))
      return res.status(400).json({ message: "invalid role" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    });

    const token = sign(user);
    res.status(201).json({ token, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message || "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user);
    res.json({ token, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message || "Login failed" });
  }
}

export async function me(req, res) {
  // requireAuth has set req.user
  res.json(req.user);
}
