const pool = require("./db");

async function seedDatabase() {
  try {
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

    // Check if author table has data
    const [authors] = await pool.query("SELECT COUNT(*) as count FROM author");
    
    if (authors[0].count > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Inserting seed data...");

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

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
}

module.exports = seedDatabase;
