const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  let randomString = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomString;
};

const getUserIdFromEmail = function(email) {
  let foundUserId = null;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUserId = users[userId].id;
    }
  }

  return foundUserId;
};

app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); // Redirect to the newly created url page
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email and password must not be blank');
  } else if (getUserIdFromEmail(req.body.email) !== null) {
    res.status(400).send('Email is already registered. Please login instead.');
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userId);
    res.redirect("/urls"); // Redirect to the newly created url page
  }
});

app.get("/urls/:id", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: currentUser };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const currentUrlId = req.params.id;
  delete urlDatabase[currentUrlId];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const newLongUrl = req.body.longURL;
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = newLongUrl;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.status(404).render("not_found");
  } else {
    res.redirect(longURL);
  }
});

app.post("/login", (req, res) => {
  const currentUserEmail = req.body.userEmail;
  const loginUserId = getUserIdFromEmail(currentUserEmail);
  if (loginUserId === null) {
    res.status(403).send('Cannot find a user with that email address. Please enter a valid user email address or register to become a user.');
  } else if (loginUserId !== null) {
    if (users[loginUserId].password !== req.body.password) {
      res.status(403).send('Invalid password. Please enter a valid password.');
    } else if (users[loginUserId].password === req.body.password) {
      const currentUserId = getUserIdFromEmail(currentUserEmail);
      res.cookie('user_id', currentUserId);
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});