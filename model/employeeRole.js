const { arch } = require("os");
let { DataTypes, sequelize } = require("../lib/");
const { role } = require("./role.model");
const { employee } = require("./employee.model");

let employeeRole = sequelize.define("employeeRole", {
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: "id",
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: role,
      key: "id",
    },
  },
});

employee.belongsToMany(role, { through: employeeRole });
role.belongsToMany(employee, { through: employeeDepartment });

module.exports = { employeeRole };
