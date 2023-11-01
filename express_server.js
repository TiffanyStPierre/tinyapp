const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  kJ4flL: {
    id: "kJ4flL",
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

const urlsForUser = function(id) {
  let userUrlList = [];

  for (const urlId in urlDatabase) {
    const urlData = urlDatabase[urlId];
    if (id === urlDatabase[urlId].userID) {
      userUrlList.push({ id: urlId, ...urlData });
    }
  }
  return userUrlList;
};

app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  if (!currentUser) {
    return res.send('<h3>You must be logged in to view your urls.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else if (currentUser) {
    const userUrls = urlsForUser(currentUser.id);
    const templateVars = { urls: userUrls, user: currentUser };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const currentUser = users[req.cookies["user_id"]];
  if (!currentUser) {
    return res.send('<h3>You must be logged in to create a new short url.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else if (currentUser) {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortUrl}`); // Redirect to the newly created url page
  }
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  if (!currentUser) {
    return res.redirect("/login");
  } else if (currentUser) {
    res.render("urls_new", templateVars);
  }
});

app.get("/login", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  if (!currentUser) {
    return res.render("login", templateVars);
  } else if (currentUser) {
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  if (!currentUser) {
    return res.render("register", templateVars);
  } else if (currentUser) {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('<h3>Email and password must not be blank</h3></br></br><a href="/register">Go Back To Registration Page</a>');
  } else if (getUserIdFromEmail(req.body.email) !== null) {
    return res.status(400).send('<h3>Email is already registered. Please login instead.</h3></br></br><a href="/login">Go To Login Page</a>');
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: currentUser };

  if (!currentUser) {
    return res.send('<h3>You must be logged in to view your urls.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else if (currentUser) {
    const userUrls = urlsForUser(currentUser.id);
    console.log(userUrls);
    let allowUser = false;
    userUrls.forEach(url => {
      if (url.id === req.params.id) {
        allowUser = true;
      }
    });
    if (allowUser) {
      return res.render("urls_show", templateVars);
    } else {
      res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const currentUrlId = req.params.id;
  const currentUser = users[req.cookies["user_id"]];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to delete a url.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else if (currentUser) {
    const userUrls = urlsForUser(currentUser.id);
    console.log(userUrls);
    let allowUser = false;
    userUrls.forEach(url => {
      if (url.id === currentUrlId) {
        allowUser = true;
      }
    });
    if (allowUser) {
      delete urlDatabase[currentUrlId];
       return res.redirect("/urls");
    } else {
      res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

app.post("/urls/:id", (req, res) => {
  const newLongUrl = req.body.longURL;
  const shortUrl = req.params.id;
  const currentUser = users[req.cookies["user_id"]];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to edit a url.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else if (currentUser) {
    const userUrls = urlsForUser(currentUser.id);
    console.log(userUrls);
    let allowUser = false;
    userUrls.forEach(url => {
      if (url.id === shortUrl) {
        allowUser = true;
      }
    });
    if (allowUser) {
      urlDatabase[shortUrl].longURL = newLongUrl;
      return res.redirect("/urls");
    } else {
      res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser };
  if (longURL === undefined) {
    return res.status(404).render("not_found", templateVars);
  } else {
    res.redirect(longURL);
  }
});

app.post("/login", (req, res) => {
  const currentUserEmail = req.body.userEmail;
  const loginUserId = getUserIdFromEmail(currentUserEmail);
  if (loginUserId === null) {
    return res.status(403).send('<h3>Cannot find a user with that email address. Please enter a valid user email address or register to become a user.</h3></br></br><a href="/login">Go Back To Login Page</a>');
  } else if (loginUserId !== null) {
    if (users[loginUserId].password !== req.body.password) {
      return res.status(403).send('<h3>Invalid password. Please enter a valid password.</h3></br></br><a href="/login">Go Back To Login Page</a>');
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