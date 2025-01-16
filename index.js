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
const { where } = require("sequelize");
const { types } = require("util");
const { attribute } = require("@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js");
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

async function getEmployeeDepartments(employeeId){
  let employeeDepartments = await employeeDepartment.findAll({where:{employeeId}});
  let departmentNames = [];
  for(const ed of employeeDepartments){
    let id = ed.departmentId;
    departmentNames.push(await department.findOne({where:{id}}));
  };
  return departmentNames;
}

app.get("/employee/:id/departments",async (req,res)=>{
  let id = req.params.id;
  let response = await getEmployeeDepartments(id);
  res.status(200).json(response);
})

async function getEmployeeRoles(employeeId){
  let employeeRoleIds = await employeeRole.findAll(
    {
      where:{employeeId}
    }
  );
  let employeeRoles = [];
  for(const roles of employeeRoleIds){
    employeeRoles.push(await role.findOne({where:{id:roles.roleId}}));
  }
  return employeeRoles;
}

app.get("/employee/:id/roles",async (req,res)=>{
  let id = req.params.id;
  let response = await getEmployeeDetails({id});
  res.status(200).json(response);
})

async function getEmployeeDetails(employeeData){
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);
  
  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

async function getEmployees(){
  let employeeDetails = await employee.findAll();
  let employees = [];
  for(const employeeDetail of employeeDetails){
    employees.push(await getEmployeeDetails(employeeDetail));
  }
  return {employees};
}

app.get("/employees",async (req,res)=>{
  let response = await getEmployees();
  res.status(200).json(response);
});

async function getEmployeeDetailsById(id){
  let employeeDetails = await employee.findOne({where:{id}});  
  let response = await getEmployeeDetails(employeeDetails);
  return {employee:response};
}

app.get("/employees/details/:id",async (req,res)=>{
  let id = req.params.id;
  let response = await getEmployeeDetailsById(id);
  res.status(200).json(response);
});

async function getEmployeeDetailsByDepartmentId(departmentId){
  let employeeIdsByDepartment = await employeeDepartment.findAll({where:{departmentId}});
  let employeesByDepartment =[];
  for(const emp of employeeIdsByDepartment){
    let basicEmployeeDetails =await employee.findOne({where:{id:emp.employeeId}});
    employeesByDepartment.push(await getEmployeeDetails(basicEmployeeDetails));
  }
  return {employees:employeesByDepartment};
}

app.get("/employees/department/:departmentId",async (req,res)=>{
  let departmentId = req.params.departmentId;
  let response = await getEmployeeDetailsByDepartmentId(departmentId);
  res.status(200).json(response);
});

async function getEmployeeByRoleId(roleId){
  let employeeRoleIds = await employeeRole.findAll({where:{roleId}});
  let employeesDataByRole = [];
  for(const employeeRoleId of employeeRoleIds){
    let basicEmployeeDetails = await employee.findOne({where:{id:employeeRoleId.employeeId}});
    console.log(basicEmployeeDetails);
    employeesDataByRole.push(await getEmployeeDetails(basicEmployeeDetails));
  }
  return {employees:employeesDataByRole};
}

app.get("/employees/role/:roleId",async (req,res)=>{
  let roleId = req.params.roleId;
  let response = await getEmployeeByRoleId(roleId);
  res.status(200).json(response);
});

async function sortEmployeesByName(order){
  let employeeBasicDetailsSortedList = await employee.findAll({order:[["name",order.toUpperCase()]]});
  let employeeDetailsSortedList = [];
  for(const emp of employeeBasicDetailsSortedList){
    employeeDetailsSortedList.push(await getEmployeeDetails(emp));
  }
  return {employees:employeeDetailsSortedList};
}

app.get("/employees/sort-by-name",async (req,res)=>{
  let order = req.query.order;
  let response = await sortEmployeesByName(order);
  res.status(200).json(response);
});

async function addEmployee(employeeObject){
  let employeeData = await employee.create(
    {name:employeeObject.name,
      email:employeeObject.email});
  let department=await employeeDepartment.create(
    {employeeId: employeeData.id,
    departmentId: employeeObject.departmentId});
  let role=await employeeRole.create(
    {employeeId:employeeData.id,
    roleId:employeeObject.roleId});

   return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

app.post("/employees/new",async (req,res)=>{
  let employeeObject = JSON.parse(JSON.stringify(req.body));
  console.log(employeeObject)
  let response = await addEmployee(employeeObject);
  res.status(200).json(response);
});

async function updateEmployeeById(id,updatedEmployee){
  let employeeObj = await employee.findOne({where:{id}});
  if(updatedEmployee.name){
    employeeObj.name = updatedEmployee.name;
  }
  if(updatedEmployee.email){
    employeeObj.email = updatedEmployee.email;
  }
  if(updatedEmployee.departmentId){
    await employeeDepartment.destroy({
      where: {
        employeeId: parseInt(employeeObj.id),
      }
    });
    await employeeDepartment.create({
      departmentId: updatedEmployee.departmentId,
      employeeId: employeeObj.id
    });

  }
  if(updatedEmployee.roleId){
    await employeeRole.destroy({
      where: {
        employeeId: parseInt(employeeObj.id),
      }
    });

    await employeeRole.create({
      roleId: updatedEmployee.roleId,
      employeeId: employeeObj.id
    });
  }

  return getEmployeeDetails(employeeObj);
}

app.post("/employees/update/:id", async (req,res)=>{
  let id = req.params.id;
  let updatedEmployee = req.body;
  let response = await updateEmployeeById(id,updatedEmployee);
  res.status(200).json(response);
});

async function deleteEmployeeById(id){
  let employeeDData = await employee.destroy({where:{id}});
  if(!employeeDData){
    return {message:"Employee not found."};
  }
  await employeeDepartment.destroy({where:{employeeId:id}});
  await employeeRole.destroy({where:{employeeId:id}});
  return {message : "Employee with ID "+ id +" has been deleted."};
}

app.post("/employees/delete", async (req,res)=>{
  let id = req.body.id;
  let response = await deleteEmployeeById(id);
  res.status(200).json(response);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
