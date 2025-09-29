import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ChildAccount from "../models/ChildAccount.js";
import Child from "../models/Child.js";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export const childLogin = async (req, res) => {
  try {
    const { username, pin } = req.body || {};
    if (!username || !pin) {
      return res.status(400).json({ message: "username and pin are required" });
    }

    const normalized = username.trim().toLowerCase();
    const account = await ChildAccount.findOne({ username: normalized }).populate({
      path: "child",
      select: "name parentId",
    });

    if (!account || !account.child) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(pin, account.pinHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    account.lastLoginAt = new Date();
    await account.save();

    const childId = String(account.child._id);
    const payload = {
      sub: childId,
      role: "child",
      childId,
      childName: account.child.name,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "3d" });

    return res.json({
      token,
      child: {
        id: childId,
        name: account.child.name,
      },
      username: account.username,
      theme: account.theme || "sunrise",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Child login failed" });
  }
};

export const childMe = async (req, res, next) => {
  try {
    const childId = req.user.childId || req.user.sub;
    const child = await Child.findById(childId)
      .populate({ path: "account", select: "username theme lastLoginAt" })
      .lean();
    if (!child) return res.status(404).json({ message: "Child not found" });
    return res.json({
      id: String(child._id),
      name: child.name,
      username: child.account?.username || null,
      theme: child.account?.theme || "sunrise",
    });
  } catch (error) {
    next(error);
  }
};
