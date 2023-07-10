const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all Bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // // Advanced Filtering {--->
  // // In url ( {{URL}}/api/v1/bootcamps?averageCost[lte]=10000 )
  // // Select and Sorting to get the spefic data in required field ( {{URL}}/api/v1/bootcamps?select=name,description )
  // let query;

  // // Copy req.query
  // const reqQuery = { ...req.query };

  // // Fields to exclude
  // const removeFields = ["select", "sort", "page", "limit"];

  // // Loop over removeFields and delete them from query
  // removeFields.forEach((param) => delete reqQuery[param]);

  // console.log(reqQuery);

  // // Create query string
  // let queryStr = JSON.stringify(reqQuery);

  // // Create operators ($gt, $gte, $lt, $lte, in,   etc)
  // queryStr = queryStr.replace(
  //   /\b(gt|gte|lt|lte|in)\b/g,
  //   (match) => `$${match}`
  // );

  // // Finding resource
  // // query = Bootcamp.find(JSON.parse(queryStr));
  // query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");
  // // query = Bootcamp.find(JSON.parse(queryStr)).populate({
  // //   path: "courses",
  // //   select: "title description",
  // // });

  // // Select fields
  // if (req.query.select) {
  //   const fields = req.query.select.split(",").join(" ");
  //   // console.log(fields);
  //   query = query.select(fields);
  // }

  // // Sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort("-createdAt");
  // }

  // // Pagination
  // // 1.   ( {{URL}}/api/v1/bootcamps?page=1&limit=2&select=name )
  // // This is for page next and previous pages
  // // 2.   ( {{URL}}/api/v1/bootcamps?page=3&limit=2&select=name )
  // const page = parseInt(req.query.page, 10) || 1;
  // const limit = parseInt(req.query.limit, 10) || 10;
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // const total = await Bootcamp.countDocuments();

  // query = query.skip(startIndex).limit(limit);

  // // Executing our query
  // const bootcamps = await query;

  // // Pagination result
  // const pagination = {};

  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit,
  //   };
  // }

  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit,
  //   };
  // }

  // res.status(200).json({
  //   success: true,
  //   count: bootcamps.length,
  //   pagination,
  //   data: bootcamps,
  // });

  // <---}

  // { Using Advanced Middleware

  res.status(200).json(res.advancedResults);

  // }

  // const bootcamps = await Bootcamp.find();

  // res
  //   .status(200)
  //   .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc        Get single Bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Create new Bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.create(req.body);
  // res.status(201).json({ success: true, data: bootcamp });

  // ********** Specific user add the bootcamp via logged in **********
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== "admin") {
    // return next(new ErrorResponse("You already have a published bootcamp", 400)
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

// @desc        Update Bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  // if (!bootcamp) {
  //   return next(
  //     new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //   );
  // }

  // res.status(200).json({ success: true, data: bootcamp });

  // ********** Only authorized User can update the bootcamp **********
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.params.id} to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete Bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  // const bootcamp = await Bootcamp.findById(req.params.id);
  // if (!bootcamp) {
  //   return next(
  //     new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //   );
  // }
  // // TypeError: bootcamp.remove is not a function
  // // await bootcamp.remove();
  // res.status(200).json({ success: true, data: {} });

  // ********** Only authorized User can delete the bootcamp **********
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.params.id} to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp = await bootcamp.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc        Get Bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance  (radius/02118/10 for boston)
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get Latitude/Longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians
  // Divide distane by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc        Upload photo for Bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized User ${req.params.id} to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload file", 400));
  }

  console.log(req.files.file);
  const file = req.files.file;

  // Make sure the image is photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check file siez
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id} ${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
});
