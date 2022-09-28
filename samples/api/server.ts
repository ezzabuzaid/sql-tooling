import cors from "cors";
import express from "express";
// import data from "./data.json";
const app = express();
app.use(cors());
app.get("/", (req, res) => {
	res.json([
		{
			id: 1,
			name: "JOHNSON",
			designation: "ADMIN",
			manager: 6,
			hired_on: "1990-12-17",
			salary: 18000,
			commission: "",
			dept: 4,
		},
		{
			id: 2,
			name: "HARDING",
			designation: "MANAGER",
			manager: 9,
			hired_on: "1998-02-02",
			salary: 52000,
			commission: 300,
			dept: 3,
		},
		{
			id: 3,
			name: "TAFT",
			designation: "SALES I",
			manager: 2,
			hired_on: "1996-01-02",
			salary: 25000,
			commission: 500,
			dept: 3,
		},
		{
			id: 4,
			name: "HOOVER",
			designation: "SALES I",
			manager: 2,
			hired_on: "1990-04-02",
			salary: 27000,
			commission: "",
			dept: 3,
		},
		{
			id: 5,
			name: "LINCOLN",
			designation: "TECH",
			manager: 6,
			hired_on: "1994-06-23",
			salary: 22500,
			commission: 1400,
			dept: 4,
		},
		{
			id: 6,
			name: "GARFIELD",
			designation: "MANAGER",
			manager: 9,
			hired_on: "1993-05-01",
			salary: 54000,
			commission: "",
			dept: 4,
		},
		{
			id: 7,
			name: "POLK",
			designation: "TECH",
			manager: 6,
			hired_on: "1997-09-22",
			salary: 25000,
			commission: "",
			dept: 4,
		},
		{
			id: 8,
			name: "GRANT",
			designation: "ENGINEER",
			manager: 10,
			hired_on: "1997-03-30",
			salary: 32000,
			commission: "",
			dept: 2,
		},
		{
			id: 9,
			name: "JACKSON",
			designation: "CEO",
			manager: "",
			hired_on: "1990-01-01",
			salary: 75000,
			commission: "",
			dept: 4,
		},
		{
			id: 10,
			name: "FILLMORE",
			designation: "MANAGER",
			manager: 9,
			hired_on: "1994-08-09",
			salary: 56000,
			commission: "",
			dept: 2,
		},
		{
			id: 11,
			name: "ADAMS",
			designation: "ENGINEER",
			manager: 10,
			hired_on: "1996-03-15",
			salary: 34000,
			commission: "",
			dept: 2,
		},
		{
			id: 12,
			name: "WASHINGTON",
			designation: "ADMIN",
			manager: 6,
			hired_on: "1998-04-16",
			salary: 18000,
			commission: "",
			dept: 4,
		},
		{
			id: 13,
			name: "MONROE",
			designation: "ENGINEER",
			manager: 10,
			hired_on: "2000-12-03",
			salary: 30000,
			commission: "",
			dept: 2,
		},
		{
			id: 14,
			name: "ROOSEVELT",
			designation: "CPA",
			manager: 9,
			hired_on: "1995-10-12",
			salary: 35000,
			commission: "",
			dept: 1,
		},
	]);
	// res.json([
	// 	{ order_id: 1, order_date: "2021-08-06", product_id: 3, order_value: 50 },
	// 	{ order_id: 2, order_date: "2021-08-09", product_id: 2, order_value: 25 },
	// 	{ order_id: 3, order_date: "2021-08-20", product_id: 3, order_value: 60 },
	// 	{ order_id: 4, order_date: "2021-08-23", product_id: 1, order_value: 100 },
	// 	{ order_id: 5, order_date: "2021-08-29", product_id: 1, order_value: 100 },
	// 	{ order_id: 6, order_date: "2021-09-02", product_id: 3, order_value: 80 },
	// ]);
});

app.listen(3000, "localhost", () => {
	console.log("server running");
});