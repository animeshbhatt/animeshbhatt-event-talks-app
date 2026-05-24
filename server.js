const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Load talk data
const talksPath = path.join(__dirname, 'data', 'talks.json');
let talks = [];
try {
    const data = fs.readFileSync(talksPath, 'utf8');
    talks = JSON.parse(data);
} catch (error) {
    console.error('Error loading talks data:', error);
    process.exit(1);
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API to get all talks
app.get('/api/talks', (req, res) => {
    res.json(talks);
});

// API to search talks by category
app.get('/api/talks/search', (req, res) => {
    const searchTerm = req.query.category;
    if (!searchTerm) {
        return res.status(400).json({ message: 'Category search term is required' });
    }

    const filteredTalks = talks.filter(talk =>
        talk.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    res.json(filteredTalks);
});

// Catch-all to serve index.html for any other routes (for single-page application behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Serving static files from:', path.join(__dirname, 'public'));
});
