
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Child from "../models/Child.js";
import ChildAccount from "../models/ChildAccount.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);
const usernameRegex = /^[a-z0-9_.-]{3,32}$/i;
const pinRegex = /^\d{4,6}$/;

const sanitizeName = (value) => {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 ? trimmed : "Star Explorer";
};

async function populateAccount(childDoc) {
  if (!childDoc) return childDoc;
  return childDoc.populate({
    path: "account",
    select: "username theme lastLoginAt updatedAt",
  });
}

function childToResponse(childDoc) {
  if (!childDoc) return null;
  const plain = childDoc.toObject({ virtuals: false });
  if (plain.account && plain.account.pinHash) delete plain.account.pinHash;
  return plain;
}

async function ensureUsernameAvailable(username, ignoreAccountId) {
  const existing = await ChildAccount.findOne({ username }).lean();
  if (existing && String(existing._id) !== String(ignoreAccountId || "")) {
    const err = new Error("Username already taken");
    err.status = 409;
    throw err;
  }
}

async function requireOwnedChild(parentId, childId) {
  const child = await Child.findOne({ _id: childId, parentId }).populate({
    path: "account",
    select: "username theme lastLoginAt updatedAt",
  });
  if (!child) {
    const err = new Error("Child not found");
    err.status = 404;
    throw err;
  }
  return child;
}

async function upsertAccount(child, { username, pin, theme }) {
  if (!usernameRegex.test(username)) {
    const err = new Error("Username must be 3-32 characters (letters, numbers, . _ -)");
    err.status = 400;
    throw err;
  }
  if (!pinRegex.test(pin)) {
    const err = new Error("PIN must be 4-6 digits");
    err.status = 400;
    throw err;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const pinHash = await bcrypt.hash(pin, 10);

  if (child.account) {
    await ensureUsernameAvailable(normalizedUsername, child.account);
    const account = await ChildAccount.findById(child.account);
    if (!account) {
      child.account = null;
      return upsertAccount(child, { username, pin, theme });
    }
    account.username = normalizedUsername;
    account.pinHash = pinHash;
    if (theme) account.theme = theme;
    await account.save();
    return account;
  }

  await ensureUsernameAvailable(normalizedUsername);
  const account = await ChildAccount.create({
    child: child._id,
    username: normalizedUsername,
    pinHash,
    theme: theme || "sunrise",
  });
  child.account = account._id;
  await child.save();
  return account;
}

export const getOrCreateDefaultChild = async (req, res, next) => {
  try {
    const parentId = toObjectId(req.user.sub);
    let child = await Child.findOne({ parentId }).sort({ createdAt: 1 });

    if (!child) {
      const defaultName = sanitizeName(req.query.name);
      child = await Child.create({
        name: defaultName,
        parentId,
        mentorIds: [],
      });
    }

    await populateAccount(child);
    return res.json(childToResponse(child));
  } catch (error) {
    next(error);
  }
};

export const createChild = async (req, res, next) => {
  try {
    const parentId = toObjectId(req.user.sub);
    const { name, username, pin, theme } = req.body || {};
    const child = await Child.create({
      name: sanitizeName(name),
      parentId,
      mentorIds: [],
    });

    if (username || pin) {
      if (!username || !pin) {
        const err = new Error("Both username and PIN are required to create an account");
        err.status = 400;
        throw err;
      }
      await upsertAccount(child, { username, pin, theme });
    }

    await populateAccount(child);
    res.status(201).json(childToResponse(child));
  } catch (error) {
    next(error);
  }
};

export const listForMentor = async (req, res, next) => {
  try {
    const children = await Child.find({ mentorIds: toObjectId(req.user.sub) })
      .sort({ createdAt: -1 })
      .populate({ path: "account", select: "username theme lastLoginAt updatedAt" });
    res.json(children.map(childToResponse));
  } catch (error) {
    next(error);
  }
};

export const listMine = async (req, res, next) => {
  try {
    const children = await Child.find({ parentId: toObjectId(req.user.sub) })
      .sort({ createdAt: -1 })
      .populate({ path: "account", select: "username theme lastLoginAt updatedAt" });
    res.json(children.map(childToResponse));
  } catch (error) {
    next(error);
  }
};

export const assignMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ message: "mentorId required" });

    const child = await Child.findByIdAndUpdate(
      toObjectId(req.params.childId),
      { $addToSet: { mentorIds: toObjectId(mentorId) } },
      { new: true }
    ).populate({ path: "account", select: "username theme lastLoginAt updatedAt" });

    if (!child) return res.status(404).json({ message: "Child not found" });
    res.json(childToResponse(child));
  } catch (error) {
    next(error);
  }
};

export const upsertChildAccount = async (req, res, next) => {
  try {
    const parentId = toObjectId(req.user.sub);
    const childId = toObjectId(req.params.childId);
    const { username, pin, theme } = req.body || {};

    if (!username || !pin) {
      return res.status(400).json({ message: "username and pin are required" });
    }

    const child = await requireOwnedChild(parentId, childId);
    await upsertAccount(child, { username, pin, theme });
    await populateAccount(child);
    res.json(childToResponse(child));
  } catch (error) {
    next(error);
  }
};

export const deleteChild = async (req, res, next) => {
  try {
    const parentId = toObjectId(req.user.sub);
    const childId = toObjectId(req.params.childId);

    // Verify parent owns the child
    const child = await Child.findOne({ _id: childId, parentId });
    if (!child) {
      const err = new Error("Child not found or not owned by parent");
      err.status = 404;
      throw err;
    }

    // Delete associated child account if exists
    if (child.account) {
      await ChildAccount.findByIdAndDelete(child.account);
    }

    // Delete the child
    await Child.findByIdAndDelete(childId);

    res.json({ 
      message: "Child deleted successfully",
      childId: childId.toString()
    });
  } catch (error) {
    next(error);
  }
};
