const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const analyzeTicket = (description) => {
    const text = description.toLowerCase();
    
    let priority = 'Low'; 
    
    if (text.includes('fire') || text.includes('crash') || text.includes('urgent')) {
        priority = 'High';
    } else if (text.includes('error') || text.includes('slow') || text.includes('broken')) {
        priority = 'Medium';
    }

    let category = 'General';
    if (text.includes('login') || text.includes('password')) {
        category = 'Access';
    } else if (text.includes('payment') || text.includes('card')) {
        category = 'Billing';
    } else if (text.includes('screen') || text.includes('mouse') || text.includes('keyboard')) {
        category = 'Hardware';
    }

    return { priority, category };
};


const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/tickets', async (req, res) => {
    try {
        
        const allTickets = await pool.query("SELECT * FROM tickets ORDER BY created_at DESC");
        
        res.json(allTickets.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


app.post('/tickets', async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and Description are required" });
        }

        const analysis = analyzeTicket(description);

        const newTicket = await pool.query(
            "INSERT INTO tickets (title, description, priority, category) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, description, analysis.priority, analysis.category]
        );

        console.log("Analyzed Ticket:", newTicket.rows[0]);

        res.status(201).json({
            message: "Ticket created successfully",
            ticket: newTicket.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});