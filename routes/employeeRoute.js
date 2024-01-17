const router = require("express").Router();
const employee = require("../controller/authController");
const Admin = require("../controller/Admin");
const allEployees = require("../controller/EmployeeController");

router.post("/newEmployee", employee.createEmpoyee); // Done
router.post("/login", employee.login); /// Done
router.patch("/updatePassword", employee.protect, employee.updatePassword); /// Done
router.patch("/changeRole", employee.protect, Admin.changeRole); // Done
router.get("/findEmployees", allEployees.findEmployee);
router.get("/Dashboard", Admin.Dashboard); /// Done
router.get("/UpdateStatus", employee.protect, Admin.UpdateEmployeeStatus); // Done
router.delete("/deleteRole", employee.protect, Admin.deleteRole); //Done

module.exports = router;
