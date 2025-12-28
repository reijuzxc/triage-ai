const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
//MIDDLEWARE

app.use(cors());
app.use(express.json());

// ROUTES
app.get('/', (req,res) =>{
    res.json({ message: "TriageAI API is running", status: "OK"});
});

app.post('/tickets', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description){
        return res.status(400).json({ error: "Title and Description are required"});
    }

    console.log("Ticket received:", { title, description});

    res.status(201).json({
        message: "Ticket created successfully",
        ticket: { title, description, id: Date.now() }
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});