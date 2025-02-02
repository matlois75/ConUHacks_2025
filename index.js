const express = require('express');
const path = require('path');

// Create Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from "public" (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route for home page
app.get('/', (req, res) => {
    res.render('index2');
});

// Catch-all route for undefined paths
app.get('*', (req, res) => {
    res.status(404).render('coming-soon');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
