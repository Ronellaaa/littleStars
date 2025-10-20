import Attempt from "../models/Attempt.model.js";

// Create attempt
export const createAttempt = async (req, res) => {
  try {
    const attempt = new Attempt(req.body);
    await attempt.save();
    res.json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get attempts (optionally filter by child/cardTitle/period=week)
/*export const getAttempts = async (req, res) => {
  const { childId, cardTitle, period } = req.query;
  const filter = {};
  if (childId) filter.childId = childId;
  if (cardTitle) filter.cardTitle = cardTitle;
  if (period === "week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    filter.createdAt = { $gte: oneWeekAgo };
  }

  try {
    const attempts = await Attempt.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};*/

// Get attempts (optionally filter by child/cardTitle/period)
export const getAttempts = async (req, res) => {
  const { childId, cardTitle, period, category } = req.query;
  const filter = {}; //filter object to hold query conditions
  if (childId) filter.childId = childId; // Add childId to filter
  if (cardTitle && cardTitle !== "all") filter.cardTitle = cardTitle; // Add cardTitle to filter
  if (category && category !== "all") filter.category = category; // Add category to filter

  if (period === "week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    filter.createdAt = { $gte: oneWeekAgo };
  }

  if (period === "month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    filter.createdAt = { $gte: oneMonthAgo };
  }

  if (period === "year") {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    filter.createdAt = { $gte: oneYearAgo };
  }

  try {
    const attempts = await Attempt.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: attempts });
    console.log("Fetched attempts:", attempts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update attempt
export const updateAttemptById = async (req, res) => {
  try {
    const updated = await Attempt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete attempt
export const deleteAttemptById = async (req, res) => {
  try {
    await Attempt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Aggregate attempts grouped by category for a child
export const getStatsByCategory = async (req, res) => {
  try {
    const { childId, period } = req.query; // Get childId and period from query parameters
    const filter = {}; // Initialize filter object

    // If childId is provided, add it to the filter
    if (childId) filter.childId = childId;

    // If "week" filter is chosen
    if (period === "week") {
      const oneWeekAgo = new Date(); 
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filter.createdAt = { $gte: oneWeekAgo };
    }

    const stats = await Attempt.aggregate([
      { $match: filter }, // Match documents based on the filter
      {
        $group: {
          _id: "$cardTitle",                //  group by each cardTitle (like "Mother", "Dog")
          totalAttempts: { $sum: 1 },       // count attempts
          correct: { $sum: { $cond: ["$success", 1, 0] } }, // count success only
        },
      },
      {
        $project: {
          category: "$_id", // rename _id to category
          totalAttempts: 1, // keep totalAttempts
          correct: 1, //keep correct
          successRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] }, // avoid division by zero
              0,
              { $divide: ["$correct", "$totalAttempts"] }, // calculate success rate
            ],
          },
        },
      },
    ]);

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Aggregate attempts grouped by category/cardTitle for all or by period
export const getTherapistStatsByCategory = async (req, res) => {
  try {
    const { childId, period, category } = req.query; // ✅ include category from query
    const filter = {}; // Initialize filter object

    // If a childId is provided, limit stats to that child;
    // otherwise it will fetch across all kids.
    if (childId) filter.childId = childId;

    // ✅ Add category filter (case-insensitive)
    if (category && category !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    // ---- PERIOD FILTERS ----
    const now = new Date();

    if (period === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filter.createdAt = { $gte: oneWeekAgo };
    }

    if (period === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    if (period === "year") {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filter.createdAt = { $gte: oneYearAgo };
    }

    // ---- AGGREGATION PIPELINE ----
    const stats = await Attempt.aggregate([
      { $match: filter }, // Match attempts based on chosen filters

      {
        // Group by cardTitle (e.g., Dog, Cow, Cat — within the chosen category)
        $group: {
          _id: "$cardTitle",
          totalAttempts: { $sum: 1 },
          correct: { $sum: { $cond: ["$success", 1, 0] } },
        },
      },
      {
        $project: {
          category: "$_id",
          totalAttempts: 1,
          correct: 1,
          successRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              { $round: [{ $divide: ["$correct", "$totalAttempts"] }, 2] },
            ],
          },
        },
      },
      { $sort: { category: 1 } },
    ]);

    res.json({ success: true, data: stats });
    console.log("Therapist Stats filter →", filter);
    console.log(`📊 Stats (${period || "all time"}):`, stats);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};