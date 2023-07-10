const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // let query;
  // if (req.params.bootcampId) {
  //   query = Course.find({ bootcamp: req.params.bootcampId });
  // } else {
  //   query = Course.find().populate({
  //     path: "bootcamp",
  //     select: "name description",
  //   });
  // }
  // const courses = await query;
  // res.status(200).json({
  //   success: true,
  //   count: courses.length,
  //   data: courses,
  // });

  // ********** Advanced Middleware **********

  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  // Check for the course
  if (!course) {
    return next(
      new ErrorResponse(`No resource found with that id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Add course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // req.body.bootcamp = req.params.bootcampId;

  // const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // if (!bootcamp) {
  //   return next(
  //     new ErrorResponse(
  //       `No bootcamp found with id of ${req.params.bootcampId}`,
  //       404
  //     )
  //   );
  // }

  // const course = await Course.create(req.body);

  // res.status(200).json({
  //   success: true,
  //   data: course,
  // });

  // ********** Only authorized User can add the course **********

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  // Let's make sure that bootcamp owner is the user that's logged in
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.user.id} to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

// @desc        Update course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  // let course = await Course.findById(req.params.id);

  // if (!course) {
  //   return next(
  //     new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
  //   );
  // }

  // course = await Course.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  // res.status(200).json({ success: true, data: course });

  // ********** Only authorized User can update the course **********

  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.user.id} to update a course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

// @desc        Delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  // const course = await Course.findById(req.params.id);

  // if (!course) {
  //   return next(
  //     new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
  //   );
  // }

  // // await course.remove();
  // await course.deleteOne();

  // res.status(200).json({ success: true, data: {} });

  // ********** Only authorized User can update the course **********

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.user.id} to delete a course ${course._id}`,
        401
      )
    );
  }

  await course.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
