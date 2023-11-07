import { expect, it } from 'vitest';
import { Parser } from '../../parser';
import { Tokenizer } from '../../tokenizer';
import { ODataVisitor } from './odata.visitor';

const data: {
  sql: string;
  url: string;
  only?: boolean;
  skip?: boolean;
}[] = [
  {
    sql: 'SELECT * FROM Products WHERE Price > 100;',
    url: '/Products?$filter=Price gt 100',
  },
  {
    sql: "SELECT * FROM Customers WHERE Country = 'Germany' OR Country = 'France';",
    url: "/Customers?$filter=Country eq 'Germany' or Country eq 'France'",
  },
  {
    sql: "SELECT * FROM Orders WHERE OrderDate > '2020-01-01' AND OrderDate < '2020-12-31';",
    url: "/Orders?$filter=OrderDate gt '2020-01-01' and OrderDate lt '2020-12-31'",
  },
  {
    sql: 'SELECT * FROM Products WHERE QuantityInStock < 50 AND Price <= 20;',
    url: '/Products?$filter=QuantityInStock lt 50 and Price le 20',
  },
  {
    sql: "SELECT * FROM Employees WHERE NOT (Title = 'Manager');",
    url: "/Employees?$filter=not (Title eq 'Manager')",
  },
  {
    sql: 'SELECT * FROM Products WHERE Price BETWEEN 10 AND 20;',
    url: '/Products?$filter=Price ge 10 and Price le 20',
  },
  {
    sql: "SELECT * FROM Orders WHERE CustomerID IN ('ALFKI', 'ANATR');",
    url: "/Orders?$filter=CustomerID eq 'ALFKI' or CustomerID eq 'ANATR'",
    skip: true,
  },
  {
    sql: 'SELECT * FROM Products WHERE (QuantityInStock * Price) > 1000;',
    url: '/Products?$filter=(QuantityInStock mul Price) gt 1000',
  },
  {
    sql: "SELECT * FROM Employees WHERE BirthDate < '1970-01-01' AND HireDate > '1995-01-01';",
    url: `/Employees?$filter=BirthDate lt '1970-01-01' and HireDate gt '1995-01-01'`,
  },
  {
    sql: "SELECT * FROM Orders WHERE Freight > 100 AND ShipCountry = 'USA';",
    url: "/Orders?$filter=Freight gt 100 and ShipCountry eq 'USA'",
  },
  // functions
  {
    sql: "SELECT * FROM Products WHERE Name LIKE 'Tea%';",
    url: "/Products?$filter=startswith(Name, 'Tea')",
  },
  {
    sql: "SELECT * FROM Products WHERE Name LIKE '%Bag';",
    url: "/Products?$filter=endswith(Name, 'Bag')",
  },
  {
    sql: "SELECT * FROM Customers WHERE substring(CompanyName, 1, 3) = 'Alf';",
    url: "/Customers?$filter=substring(CompanyName, 0, 3) eq 'Alf'",
  },
  {
    sql: 'SELECT * FROM Employees WHERE LENGTH(FirstName) = 4;',
    url: '/Employees?$filter=length(FirstName) eq 4',
  },
  {
    sql: "SELECT * FROM Employees WHERE UPPER(FirstName) = 'JOHN';",
    url: "/Employees?$filter=toupper(FirstName) eq 'JOHN'",
  },
  {
    sql: "SELECT * FROM Employees WHERE LOWER(LastName) = 'smith';",
    url: "/Employees?$filter=tolower(LastName) eq 'smith'",
  },
  {
    sql: "SELECT * FROM Customers WHERE REPLACE(CompanyName, ' ', '') = 'North/South';",
    url: "/Customers?$filter=replace(CompanyName, ' ', '') eq 'North/South'",
  },
  {
    sql: "SELECT * FROM Employees WHERE FirstName LIKE '_ohn' and LastName LIKE 'S%';",
    url: "/Employees?$filter=length(FirstName) eq 4 and endswith(FirstName, 'ohn') and startswith(LastName, 'S')",
  },
  {
    sql: "SELECT * FROM Employees WHERE FirstName LIKE 'J%n';",
    url: "/Employees?$filter=startswith(FirstName, 'J') and endswith(FirstName, 'n')",
  },
  {
    sql: "SELECT * FROM Employees WHERE instr(FirstName, 'a') > 0;",
    url: "/Employees?$filter=indexof(FirstName, 'a') ge 1",
  },
  {
    sql: "SELECT * FROM Products WHERE Name LIKE 'Tea%';",
    url: "/Products?$filter=startswith(Name, 'Tea')",
  },
  {
    sql: "SELECT * FROM Products WHERE Name LIKE '%Bag';",
    url: "/Products?$filter=endswith(Name, 'Bag')",
  },
  {
    sql: "SELECT * FROM Products WHERE Name LIKE '%oolong%';",
    url: "/Products?$filter=contains(Name, 'oolong')",
  },
  {
    sql: 'SELECT * FROM Employees WHERE LENGTH(FirstName) = 4;',
    url: '/Employees?$filter=length(FirstName) eq 4',
  },
  {
    sql: "SELECT * FROM Employees WHERE LOWER(FirstName) = 'john';",
    url: "/Employees?$filter=tolower(FirstName) eq 'john'",
  },
  {
    sql: "SELECT * FROM Employees WHERE UPPER(FirstName) = 'JOHN';",
    url: "/Employees?$filter=toupper(FirstName) eq 'JOHN'",
  },
  {
    sql: "SELECT * FROM Employees WHERE FirstName || ' ' || LastName = 'John Doe';",
    url: "/Employees?$filter=concat(concat(FirstName, ' '), LastName) eq 'John Doe'",
  },
  {
    url: `/Appointments?$filter=time(StartTime) eq '12:00:00'`,
    sql: "SELECT * FROM Appointments WHERE strftime('%H:%M:%S', StartTime) = '12:00:00';",
  },
  {
    url: `/Tasks?$filter=day(DueDate) eq '15'`,
    sql: `SELECT * FROM Tasks WHERE strftime('%d', DueDate) = '15';`,
  },
  {
    url: `/Sales?$filter=month(ShipDate) eq '12'`,
    sql: `SELECT * FROM Sales WHERE strftime('%m', ShipDate) = '12';`,
  },
  {
    url: '/Employees?$filter=year(BirthDate) eq 1978',
    sql: "SELECT * FROM Employees WHERE strftime('%Y', BirthDate) = 1978;",
  },
  {
    url: '/Sales?$filter=month(ShipDate) eq 12',
    sql: "SELECT * FROM Sales WHERE strftime('%m', ShipDate) = 12;",
  },
  {
    url: '/Meetings?$filter=hour(StartTime) eq 14',
    sql: "SELECT * FROM Meetings WHERE strftime('%H', StartTime) = 14;",
  },
  {
    url: '/Messages?$filter=minute(SentTime) eq 30',
    sql: "SELECT * FROM Messages WHERE strftime('%M', SentTime) = 30;",
  },
  {
    url: '/Events?$filter=second(EndTime) eq 45',
    sql: "SELECT * FROM Events WHERE strftime('%S', EndTime) = 45;",
  },
  {
    url: `/People?$filter=date(BirthDate) eq '2000-01-01'`,
    sql: "SELECT * FROM People WHERE strftime('%Y-%m-%d', BirthDate) = '2000-01-01';",
  },
  {
    url: `/Appointments?$filter=time(StartTime) eq '12:00:00'`,
    sql: "SELECT * FROM Appointments WHERE strftime('%H:%M:%S', StartTime) = '12:00:00';",
  },
];

it.each(
  data
    .filter((item) => ('only' in item ? item.only : true))
    .filter((item) => !item.skip)
    .map((item) => [item.sql, item.url]),
)(`%s \n %s`, (sql, url) => {
  const tokenizer = new Tokenizer(sql);
  const parser = new Parser(tokenizer.tokenize());
  const ast = parser.parse();
  const visitor = new ODataVisitor();
  expect(visitor.execute(ast).trim()).toEqual(url);
});
