const express = require("express");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, auhtorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Review, { path: "bootcamp", select: "name description" }),
    getReviews
  )
  .post(protect, auhtorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, auhtorize("user", "admin"), updateReview)
  .delete(protect, auhtorize("user", "admin"), deleteReview);

module.exports = router;
