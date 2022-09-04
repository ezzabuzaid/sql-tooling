import { ajax } from "rxjs/ajax";
global.XMLHttpRequest = require("xhr2");
// boilerplate

const sql_input = `select name from products;`;

const graph_ql_input = `{
  products {
    name
  }
}`;

// not much of a difference for a simple query
// but imagine the reduction of the learning curve
// to learn graphql for both backend and frontend

// Now, imagine handing the work of simple API and crud to the frontend
// and let the backend handle the infrastructure

// in the backend there will be only one API endpoint
// thay you'll have full control over it
// for example, you can prevent using of "*" or only allow maximum to 100 rows

// There's no possiplilty of:
// 1. SQL Injection because the parser will have validation option, so it is up to you how much power you want to give the client.
// 2. no valid query because you can validate a string if it was SQL statement both on client and server

const url = `http://localhost:3000/sql?query=${sql_input}`;

ajax(url).subscribe(({ response }) => console.log(response));
