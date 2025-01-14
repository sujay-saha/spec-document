/*Lib*/
let sq = require("sequelize");

let sequelize = new sq.Sequelize("sqlite:../database.sqlite");

module.exports = { DataTypes: sq.DataTypes, sequelize };
