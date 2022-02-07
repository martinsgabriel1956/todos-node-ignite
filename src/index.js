const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) response.status(404).json({ error: "User not found" });

  request.username = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const id = uuidv4();

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists)
    response.status(400).json({ error: "User already exists" });

  const createUser = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(createUser);

  return response.json(createUser).status(201);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo).status(200).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.done = !todo.done;

  return response.json(todo).status(200);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  username.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
