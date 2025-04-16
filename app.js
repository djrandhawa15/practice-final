const express = require("express");
const pool = require("./db");
const path = require("path");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const [authors] = await pool.query(`
    SELECT author.*, COUNT(book.book_id) AS book_count
    FROM author
    LEFT JOIN book ON author.author_id = book.author_id
    GROUP BY author.author_id
  `);
  res.render("authors", { authors });
});

app.post("/addAuthor", async (req, res) => {
  const { first_name, last_name, birth_date } = req.body;
  await pool.query(
    "INSERT INTO author (first_name, last_name, birth_date) VALUES (?, ?, ?)",
    [first_name, last_name, birth_date || null]
  );
  res.redirect("/");
});

app.post("/deleteAuthor", async (req, res) => {
  const { author_id } = req.body;
  await pool.query("DELETE FROM book WHERE author_id = ?", [author_id]);
  await pool.query("DELETE FROM author WHERE author_id = ?", [author_id]);
  res.redirect("/");
});

app.get("/showBooks", async (req, res) => {
  const [books] = await pool.query("SELECT * FROM book WHERE author_id = ?", [
    req.query.id,
  ]);
  const [author] = await pool.query(
    "SELECT first_name, last_name FROM author WHERE author_id = ?",
    [req.query.id]
  );
  res.render("books", { books, author: author[0], authorId: req.query.id });
});

app.post("/addBook", async (req, res) => {
  const { author_id, title, description, ISBN } = req.body;
  await pool.query(
    "INSERT INTO book (author_id, title, description, ISBN) VALUES (?, ?, ?, ?)",
    [author_id, title, description, ISBN]
  );
  res.redirect(`/showBooks?id=${author_id}`);
});

app.post("/deleteBook", async (req, res) => {
  const { book_id, author_id } = req.body;
  await pool.query("DELETE FROM book WHERE book_id = ?", [book_id]);
  res.redirect(`/showBooks?id=${author_id}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});