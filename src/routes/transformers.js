
const express = require("express");
const { getJson } = require("../services/portalClient");
const { sendPortalError } = require("../utils/portalError");

const router = express.Router();

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error: "Page must be a positive integer",
    });
  }

  try {
    const data = await getJson("/portal/dts", { page });
    return res.status(200).json(data);
  } catch (error) {
    return sendPortalError(res, error, "Transformer lookup");
  }
});

module.exports = router;
