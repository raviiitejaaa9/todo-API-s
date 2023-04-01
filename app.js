const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

module.exports = app;

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

console.log(dbPath);

const initializeBDAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at port 3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeBDAndServer();

//API_1
app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  console.log(status);
  console.log(priority);
  console.log(search_q);

  const sqlQuery = `
            SELECT *
            FROM todo 
            WHERE priority LIKE '%${priority}%' AND 
                   status LIKE '%${status}%' AND
                   todo LIKE '%${search_q}%'  ;`;
  const reqList = await db.all(sqlQuery);
  response.send(reqList);
});

//API_2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const sqlQuery = `
            SELECT *
            FROM todo 
            WHERE id = ${todoId} ;`;
  const reqList = await db.get(sqlQuery);
  response.send(reqList);
});

//API_3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(id, todo, priority, status);

  const sqlQuery = `
            INSERT INTO todo
                (id,todo,priority,status)
            VALUES
                (${id},'${todo}','${priority}','${status}') ;`;

  await db.run(sqlQuery);
  response.send("Todo Successfully Added");
});

//API_4
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);

  const requestObject = request.body;
  console.log(requestObject);

  let changedColumn = "";
  switch (true) {
    case requestObject.todo !== undefined:
      changedColumn = "todo";
      break;
    case requestObject.priority !== undefined:
      changedColumn = "priority";
      break;
    case requestObject.status !== undefined:
      changedColumn = "status";
      break;
  }
  const previousTodoQuery = `
            SELECT *
            FROM todo
            WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  //console.log(previousTodo);

  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body;

  console.log(todo, priority, status);

  const sqlQuery = `
            UPDATE todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}'
            WHERE 
                id = ${todoId} ;`;

  await db.run(sqlQuery);
  response.send(`${changedColumn} Updated`);
});

//API_5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const sqlQuery = `
            DELETE 
            FROM 
                todo
            WHERE 
                id = ${todoId} ;`;

  await db.run(sqlQuery);
  response.send("Todo Deleted");
});
