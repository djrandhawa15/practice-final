const pool = require("./db");

async function seedDatabase() {
  try {
    // Check if author table exists and has data
    const [authors] = await pool.query("SELECT COUNT(*) as count FROM author");
    
    if (authors[0].count > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Create author table if doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS author (
        author_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        birth_date DATE
      )
    `);

    // Create book table if doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book (
        book_id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        ISBN VARCHAR(20),
        FOREIGN KEY (author_id) REFERENCES author(author_id)
      )
    `);

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
      (2, 'Pride and Prejudice', 'A romantic novel of manners', '978-0141439518'),
      (2, 'Sense and Sensibility', 'A novel about two sisters', '978-0141439662'),
      (3, 'The Great Gatsby', 'A novel about the American Dream', '978-0743273565'),
      (4, 'To Kill a Mockingbird', 'A classic about racial injustice', '978-0061120084'),
      (5, 'Harry Potter and the Philosopher\'s Stone', 'The start of a magical series', '978-0747532699')
    `);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
}

module.exports = seedDatabase;
