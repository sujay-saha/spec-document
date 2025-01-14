let express = require("express");
let { employee } = require("./model/employee.model");
let { role } = require("./model/role.model");
let { department } = require("./model/department.model");
let { employeeDepartment } = require("./model/employeeDepartment.model");
let { employeeRole } = require("./model/employeeRole.model");

let { sequelize } = require("./lib/index");
let { Op } = require("@sequelize/core");

const { parse } = require("querystring");

let cors = require("cors");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { userInfo } = require("os");
const { threadId } = require("worker_threads");
// let sqlite3 = require('sqlite3').verbose();
// let { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Endpoint to seed database
app.get("/seed_db", async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: "Engineering" },
    { name: "Marketing" },
  ]);

  const roles = await role.bulkCreate([
    { title: "Software Engineer" },
    { title: "Marketing Specialist" },
    { title: "Product Manager" },
  ]);

  const employees = await employee.bulkCreate([
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Singh", email: "priya.singh@example.com" },
    { name: "Ankit Verma", email: "ankit.verma@example.com" },
  ]);

  // Associate employees with departments and roles using create method on junction models
  await employeeDepartment.create({
    employeeId: employees[0].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[0].id,
    roleId: roles[0].id,
  });

  await employeeDepartment.create({
    employeeId: employees[1].id,
    departmentId: departments[1].id,
  });
  await employeeRole.create({
    employeeId: employees[1].id,
    roleId: roles[1].id,
  });

  await employeeDepartment.create({
    employeeId: employees[2].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[2].id,
    roleId: roles[2].id,
  });

  return res.json({ message: "Database seeded!" });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
