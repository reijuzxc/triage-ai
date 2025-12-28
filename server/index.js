const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

// AI Triage Logic
const analyzeTicket = (description) => {
    const text = description.toLowerCase();
    
    let priority = 'Low'; 
    let category = 'General';
    let resolution = 'Investigate issue details.';
    
    if (text.includes('fire') || text.includes('crash') || text.includes('urgent')) {
        priority = 'High';
    } else if (text.includes('error') || text.includes('slow') || text.includes('broken')) {
        priority = 'Medium';
    }

    if (text.includes('login') || text.includes('password')) {
        category = 'Access';
        resolution = 'Reset password via Admin Panel and verify email.';
    } else if (text.includes('payment') || text.includes('card')) {
        category = 'Billing';
        resolution = 'Check Stripe dashboard for failed transactions.';
    } else if (text.includes('screen') || text.includes('mouse') || text.includes('keyboard')) {
        category = 'Hardware';
        resolution = 'Check cabling and replace peripheral if needed.';
    } else if (text.includes('fire') || text.includes('smoke')) {
        category = 'Safety';
        resolution = 'Evacuate immediately and call emergency services.';
    }

    return { priority, category, resolution };
};


const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: "TriageAI API is running", status: "OK"});
});
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
            "INSERT INTO tickets (title, description, priority, category, resolution) VALUES ($1, $2, $3, $4, $5) RETURNING *",
[title, description, analysis.priority, analysis.category, analysis.resolution]
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