import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(""); 
  const [tickets, setTickets] = useState([]); 


  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await axios.post('http://localhost:5000/tickets', {
        title: title,
        description: description
      });

      setStatus("Ticket Created Successfully!");
      setTitle("");       
      setDescription(""); 
      
      fetchTickets();

    } catch (error) {
      console.error("Error:", error);
      setStatus("Error: Could not create ticket.");
    }
  };

  return (
    <div className="app-container">
      <h1>TriageAI Support</h1>
      
      {/* SECTION 1: THE FORM */}
      <div className="ticket-card">
        <h2>Create New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Login not working..."
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
              rows="4"
            />
          </div>
          <button type="submit" className="submit-btn">Submit Ticket</button>
        </form>
        {status && <p className="status-message">{status}</p>}
      </div>

      {/* THE DASHBOARD */}
      <div className="dashboard-container">
        <h2>Ticket Queue ({tickets.length})</h2>
        
        {tickets.length === 0 ? (
          <p>No tickets yet. Good job!</p>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-item">
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
                {/* Suggested Resolution Box */}
                <div className="resolution-box">
                      <strong>🤖 AI Suggestion:</strong> {ticket.resolution || "No suggestion available."}
                   </div>
                <div className="ticket-meta">
                  {/* Priority Badge */}
                  <span className={`badge priority-${ticket.priority?.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                  
                  {/* Category Badge */}
                  <span className="badge category">
                    {ticket.category}
                  </span>

                  <span className="date">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;