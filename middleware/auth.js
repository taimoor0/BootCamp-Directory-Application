const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Set token from Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = await req.headers.authorization.split(" ")[1];
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  //   Make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for user and add it to request body
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
});

// Grant access to specific role
exports.auhtorize = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access the route`,
          403
        )
      );
    }
    next();
  };
};
