const employee = require("../models/employee");
const jwt = require("jsonwebtoken");
const asyncCatch = require("../utills/asyncCatch");
const AppError = require("../utills/AppError");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (Employee, statusCode, req, res) => {
  const jwtToken = signToken(Employee._id);

  res.cookie("jwt", jwtToken, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  Employee.password = undefined;

  res.status(statusCode).json({
    status: "success",
    jwtToken,
    data: {
      Employee,
    },
  });
};

exports.createEmpoyee = asyncCatch(async (req, res, next) => {
  const data = req.body;
  const newEmployee = await employee.create(data);
  res.status(200).json({
    status: "success",
    message: "data successfully save",
  });
  if (!newEmployee) {
    return next(new AppError("Something went wrong"));
  }

  createSendToken(newEmployee, 201, req, res);
});

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const Employee = await employee.findOne({ email }).select("+password");

  if (
    !Employee ||
    !(await Employee.correctPassword(password, Employee.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(Employee, 200, req, res);
});

exports.protect = asyncCatch(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  console.log(token, process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentEmployee = await employee.findById(decoded.id);
  console.log(currentEmployee);
  if (!currentEmployee) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (currentEmployee.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.auth = currentEmployee;
  next();
});

exports.updatePassword = asyncCatch(async (req, res, next) => {
  const Employee = await employee.findById(req.auth.id).select("+password");

  console.log("now..................");
  if (
    !(await Employee.correctPassword(
      req.body.passwordCurrent,
      Employee.password
    ))
  ) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  Employee.password = req.body.password;
  Employee.passConfirm = req.body.passwordConfirm;
  await Employee.save();

  createSendToken(Employee, 200, req, res);
});
