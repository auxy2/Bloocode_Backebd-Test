const employee = require("../models/employee");
const AppError = require("../utills/AppError");
const asyncCatch = require("../utills/asyncCatch");

/////////////////////////////////////////

exports.changeRole = asyncCatch(async (req, res, next) => {
  const Admin = await employee.findOne(req.auth).select("+role");
  if (Admin.role !== "manager") {
    return next(new AppError("You dont have access to this page", 400));
  }

  const { role, Id } = req.query;
  const Employee = await employee.findById({ _id: Id });

  if (Employee) {
    Employee.role = role;
    await Employee.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    message: `successfully changed ${Employee.name} role to ${role}`,
  });
});

////////////////////////////
exports.Dashboard = asyncCatch(async (req, res, next) => {
  const Admin = await employee.findOne(req.auth).select("+role");
  if (Admin.role !== "manager") {
    return next(new AppError("You dont have access to this page", 400));
  }

  const Employees = await employee.find();
  const totalEmployees = Employees.length;

  let allRoles = [];
  for (const data of Employees) {
    if (data.role) {
      allRoles.push(data.role);
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      totalEmployees,
      allRoles,
    },
  });
});

exports.UpdateEmployeeStatus = asyncCatch(async (req, res, next) => {
  const { Id, status } = req.query;
  const Admin = await employee.findOne(req.auth).select("+role");
  if (Admin.role !== "manager") {
    res.status(400).json({
      status: "failed",
      message: "You dont have access to this page",
    });
  }

  const Employee = await employee.findOne({ _id: Id });
  if (status === "employed") {
    Employee.status = status;
  }
  status === "employed"
    ? (Employee.status = status)
    : (Employee.status = status);
  await Employee.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: `You successfully change ${Employee.name} Staus to ${status}`,
  });
});

exports.deleteRole = asyncCatch(async (req, res, next) => {
  const Admin = await employee.findOne(req.auth).select("+role");

  if (Admin.role !== "manager") {
    res.status(400).json({
      status: "failed",
      message: "You dont have access to this page",
    });
  }

  const Employee = await employee.findById({ _id: req.query.Id });
  if (!Employee) {
    return next(new AppError("Something went wrong", 400));
  }
  Employee.role = undefined;
  await Employee.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: `you successfuly deleted ${Employee.name} role`,
  });
});
