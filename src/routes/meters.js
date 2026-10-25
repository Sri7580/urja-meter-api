
const express = require("express");
const { getJson } = require("../services/portalClient");
const { sendPortalError } = require("../utils/portalError");

const router = express.Router();

router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const page = Number(req.query.page ?? 1);

  if (q.length > 100) {
    return res.status(400).json({
      error: "Search query must be 100 characters or fewer",
    });
  }

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error: "Page must be a positive integer",
    });
  }

  try {
    const data = await getJson("/portal/meters/search", { q, page });
    return res.status(200).json(data);
  } catch (error) {
    return sendPortalError(res, error, "Meter search");
  }
});

module.exports = router;
