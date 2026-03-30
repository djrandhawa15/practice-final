const express = require("express");
const pool = require("./db");
const path = require("path");
const seedDatabase = require("./seed");
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

app.get("/api/seed", async (req, res) => {
  try {
    console.log("Manual seed endpoint called - reseeding database...");
    
    // Delete all existing book and author data
    await pool.query("DELETE FROM book");
    await pool.query("DELETE FROM author");
    
    console.log("Data deleted, inserting fresh seed data...");

    // Seed authors
    await pool.query(`
      INSERT INTO author (first_name, last_name, birth_date) VALUES
      ('George', 'Orwell', '1903-06-25'),
      ('Jane', 'Austen', '1775-12-16'),
      ('F. Scott', 'Fitzgerald', '1896-09-24'),
      ('Harper', 'Lee', '1926-04-28'),
      ('J.K.', 'Rowling', '1965-07-31')
    `);

    // Seed books
    await pool.query(`
      INSERT INTO book (author_id, title, description, ISBN) VALUES
      (1, '1984', 'A dystopian novel about totalitarianism', '978-0451524935'),
      (1, 'Animal Farm', 'A satirical allegory of the Russian Revolution', '978-0451526342'),
      (1, 'Burmese Days', 'A novel set in colonial Burma', '978-0141185362'),
      (2, 'Pride and Prejudice', 'A romantic novel of manners', '978-0141439518'),
      (2, 'Sense and Sensibility', 'A novel about two sisters', '978-0141439662'),
      (2, 'Emma', 'A romantic comedy of errors', '978-0141439587'),
      (2, 'Northanger Abbey', 'A parody of Gothic novels', '978-0141439570'),
      (3, 'The Great Gatsby', 'A novel about the American Dream', '978-0743273565'),
      (3, 'Tender Is the Night', 'A novel about American expatriates', '978-0743273672'),
      (4, 'To Kill a Mockingbird', 'A classic about racial injustice', '978-0061120084'),
      (4, 'Go Set a Watchman', 'A sequel to To Kill a Mockingbird', '978-0062409256'),
      (5, 'Harry Potter and the Philosopher\'s Stone', 'The start of a magical series', '978-0747532699'),
      (5, 'Harry Potter and the Chamber of Secrets', 'The second book in the series', '978-0747538494'),
      (5, 'Harry Potter and the Prisoner of Azkaban', 'The third book in the series', '978-0747542155'),
      (5, 'Harry Potter and the Goblet of Fire', 'The fourth book in the series', '978-0747546245')
    `);

    console.log("Database reseeded successfully!");
    res.json({ 
      success: true, 
      message: "Database reseeded with 15 books across 5 authors!",
      booksCount: 15,
      authorsCount: 5
    });
  } catch (error) {
    console.error("Error reseeding database:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// Seed database on startup, then start server
seedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});