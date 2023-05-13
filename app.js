const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const sanitizeHtml = require("sanitize-html");
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Display all messages
app.get("/messages", (req, res) => {
    // Get all messages from the database
  db.query("SELECT * FROM messages ORDER BY created_at DESC", (err, result) => {
    if (err) throw err;
    const messages = result.map((message) => ({
      id: message.id,
      message: message.message,
      timestamp: message.created_at,
    }));
    res.send(generateMessageList(messages));
  });
});

// Display all messages in HTML format
function generateMessageList(messages) {
  let html = "<h1>All Messages</h1><ul>";

  messages.forEach((message) => {
    const timestamp = new Date(message.timestamp).toLocaleString();
   // Add a delete button to each message
    html += `
        <li>${message.message} - ${timestamp} - ${message.id}
          <form method="POST" action="/messages/${message.id}?_method=DELETE">
            <button type="submit">Delete</button>
          </form>
        </li>`;
  });

  html += '</ul><a href="/">Back to form</a>';
  return html;
}

// Delete a message by ID
app.delete("/messages/:id", (req, res) => {
  const messageId = req.params.id;

  const sql = "DELETE FROM messages WHERE id = ?";
  db.query(sql, [messageId], (err, result) => {
    if (err) throw err;

    // Check if the message was deleted and reset the IDs if there are no more messages
    if (result.affectedRows > 0) {
      db.query("SELECT COUNT(*) AS total FROM messages", (err, result) => {
        if (err) throw err;
        const totalCount = result[0].total;

        if (totalCount === 0) {
          db.query("ALTER TABLE messages AUTO_INCREMENT = 1", (err) => {
            if (err) throw err;
            res.redirect("/messages"); // Send a success status
          });
        } else {
          res.redirect("/messages"); // Send a success status without resetting the IDs
        }
      });
    } else {
      res.sendStatus(404); // Send a not found status
    }
  });
});

// Create a new message
app.post("/messages", (req, res) => {
  let message = req.body.message;

  // Sanitize the message and prevent HTML injection
  message = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Basic validation
  if (!message) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }
  if (message.length > 140) {
    return res.status(400).json({ error: "Message is too long" });
  }

  // Insert the message into the database
  db.query("INSERT INTO messages (message) VALUES (?)", [message], (err) => {
    if (err) throw err;
    res.status(200).json({ message: "Message created successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
