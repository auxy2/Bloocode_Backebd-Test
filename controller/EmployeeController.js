const employee = require("../models/employee");
const asyncCatch = require("../utills/asyncCatch");

exports.findEmployee = asyncCatch(async (req, res) => {
  const Employees = await employee.find({
    name: req.query.name,
    _id: req.query.Id,
  });
  if (!Employees) {
    res.status(400).json({
      status: "fail",
      message: "please put in  correct data",
    });
  }

  res.status(200).json({
    status: "success",
    data: Employees,
  });
});
