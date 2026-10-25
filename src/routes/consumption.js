
const express = require("express");
const { getJson } = require("../services/portalClient");
const { sendPortalError } = require("../utils/portalError");

const router = express.Router();

function validateMeterId(meterId) {
  return /^[A-Za-z0-9-]{1,50}$/.test(meterId);
}

router.get("/:meterId/energy", async (req, res) => {
  const { meterId } = req.params;

  if (!validateMeterId(meterId)) {
    return res.status(400).json({ error: "Invalid meter ID" });
  }

  try {
    const data = await getJson(
      `/portal/meters/${encodeURIComponent(meterId)}/energy`
    );

    return res.status(200).json(data);
  } catch (error) {
    return sendPortalError(res, error, "Energy lookup");
  }
});

router.get("/:meterId/geo", async (req, res) => {
  const { meterId } = req.params;

  if (!validateMeterId(meterId)) {
    return res.status(400).json({ error: "Invalid meter ID" });
  }

  try {
    const data = await getJson(
      `/portal/meters/${encodeURIComponent(meterId)}/geo`
    );

    return res.status(200).json(data);
  } catch (error) {
    return sendPortalError(res, error, "Location lookup");
  }
});

module.exports = router;
