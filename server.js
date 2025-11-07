const express = require('express');
const mysql = require('mysql2');
const connectionDB = require('./config/db')
const cors = require('cors');
const app = require('express')();
const PORT = 8080;

connectionDB();

app.use(express.json())



//enable CORS
app.use(cors({
    origin: [''], //replace with your frontend origin
    methods: ["POST", "GET", "UPDATE", "DELETE"],
    credentials: true, //credentials are allowed
    optionSuccessStatus: 200 //Indicates to the browser that the preflight options request was successful
}))

//Register attendee
app.post('/sign-up', (req, res) => {
    const {name, email, password } = req.body;

    if(name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields make sure')
    }
})



//hash password
const salt = bcrypt.genSalt(10)
const { bcrypt } = req.body;
bcrypt.hash(password, salt, (err, hashedPassword) => {
    if(err) {
        console.error("Error while hashing password:", err);
        return res.status(500).json({ error: "Error while hashing password" });
    }
})

//create user/attendee
const sql = "INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)";
const {name, email, hashedPassword } = req.body;
const values = [name, email, hashedPassword];

      connectionDB.query(sql, values, (err, result) => {
          if (err) {
              console.error("Error while inserting data into the database:", err);
              return res.status(500).json({ error: "Error while inserting data into the database" });
          }
          console.log("Data inserted successfully:", result);
          return res.json({ status: "Success" });

        });

// Authenticate user
// @route  POST /api/attendee/login
app.post('/login',(req ,res) => {
  const sql = 'SELECT *  FROM users WHERE email = ?';
  connectionDB.query(sql, [req.body.email], (err, data) => {
      if (err) {
          return res.status(500).json({ error: "Internal server error" });
      }
  
      if (data.length === 0) {
          return res.status(404).json({ error: "No user found with this email" });
      }
  
      const user = data[0];
      bcrypt.compare(req.body.password.toString(), user.password, (err, response) => {
          if (err) {
              return res.status(500).json({ error: "Internal server error" });
          }
  
          if (response) {
            return res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)    
            });
          } else {
            return res.status(401).json({ error: "Incorrect email or password" });
          }
      });
  });    
})

// @route  POST /api/create event
app.post('/api/events', async (req, res) => {
    const { event_name, description, event_date, event_time, venueIdd, organizerId, available_seats, price } = req.body;

    // Basic validation
    if (!event_name || !description || !event_date || !event_time || !venueIdd || !organizerId || !available_seats || !price) {
        return res.status(400).json({ message: 'Missing required event fields.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO events (event_name, description, event_date, event_time, venue_id, organizer_id, available_seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [event_name, description, event-date, event_time, venue_id, organizer_id, available_seats, price]
        );
        res.status(201).json({ message: 'RSVP submitted successfully', rsvpId: result.insertId });
        res.status(200).json({
            _id: event._id,
            description: description,
            event: event_date,
            time: event_time,
            venue: venue_id,
            organizer: organizer_id,
            seats: available_seats,
            price: price,
            token: generateToken(seller._id)
        })
    } catch (error) {
        console.error('Error inserting event into database:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST attendees RSVP
app.post('/api/rsvps', async (req, res) => {
    const { userId, eventId, status, guestsCount } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO rsvps (rsvp_id, user_id, event_id, status, guests_count) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, guests_count = ?',
            [userId, eventId, status, guestsCount, status, guestsCount]
        );
        res.status(200).json({ message: 'RSVP submitted successfully', rsvpId: result.insertId });
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        res.status(500).json({ error: 'Failed to submit RSVP' });
    }
});

//Limit RSVP capacity
const checkCapacityQuery = `
        SELECT e.capacity, COUNT(r.rsvp_id) AS current_rsvps 
        FROM events e
        LEFT JOIN rsvps r ON e.event_id = r.event_id
        WHERE e.event_id = ?
        GROUP BY e.event_id;
    `;

    connectionDB.query(checkCapacityQuery, [event_id], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length === 0) {
            return res.status(404).send('Event not found');
        }

        const { capacity, current_rsvps } = results[0];

        if (current_rsvps >= capacity) {
            // Capacity reached, reject the RSVP
            return res.status(400).json({ message: 'Sorry, the event is at full capacity.' });
        }

        // 2. If capacity is available, insert the new RSVP
        const insertRsvpQuery = 'INSERT INTO rsvps (event_id, user_name, user_email) VALUES (?, ?, ?)';
        cennctionDB.query(insertRsvpQuery, [event_id, name, email], (err, result) => {
            if (err) {
                // Check for duplicate entry error
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'You have already RSVPd for this event.' });
                }
                return res.status(500).send('Error submitting RSVP');
            }
            res.status(200).json({ message: 'RSVP successful!' });
        });
    });

// Endpoint to get all RSVPs
app.get('/api/pending-rsvps', (req, res) => {
    // Logic to fetch RSVPs with status 'pending' from the database

    connectionDB.query('SELECT * FROM rsvps', (error, results) => {
    if (error) {
      console.error('Error fetching rsvps:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // const {rsvpId, name, email} = req.body
    res.status(results)(200).json({
        id: rsvpId,
        name,
        email,
    })
  });
});

// Endpoint to approve an RSVP
app.post('/api/approve-rsvp/:id', (req, res) => {
    const rsvpId = req.params.id;
    // Logic to update the RSVP status to 'approved' in the database
    // Example: db.collection('rsvps').updateOne({ id: rsvpId }, { $set: { status: 'approved' }})
    connectionDB.updateOne({ id: rsvpId }, { $set: { status: 'approved'}})
    console.log(`RSVP ${rsvpId} approved.`);
    res.status(200).send({ message: 'RSVP approved' });
});

// Endpoint to reject an RSVP
app.post('/api/reject-rsvp/:id', (req, res) => {
    const rsvpId = req.params.id;
    // Logic to update the RSVP status to 'rejected' in the database
    // Example: db.collection('rsvps').updateOne({ id: rsvpId }, { $set: { status: 'rejected' }})
    connectionDB.updateOne({ id: rsvpId }, { $set: { status: 'rejected'}})
    console.log(`RSVP ${rsvpId} rejected.`);
    res.status(200).send({ message: 'RSVP rejected' });
});

//Pagination
//Fetch event data
app.get('/events', (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) AS total FROM events';
  const dataQuery = 'SELECT * FROM events LIMIT ? OFFSET ?';

  connectionDB.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const totalEvents = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    connection.query(dataQuery, [parseInt(limit), parseInt(offset)], (err, dataResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json({
        totalEvents,
        totalPages,
        currentPage: parseInt(page),
        events: dataResult,
      });
    });
  });
});

//Filter events by date, location or keyword
app.get('/api/events', (req, res) => {
    const { event_id, start_date, end_date, venue_id } = req.query;

    let sqlQuery = 'SELECT * FROM events WHERE 1=1'; // Start with a condition that is always true

    const queryParams = [];

    // Add keyword filter
    if (event_id) {
        // Use LIKE for partial matches in relevant fields (e.g., title, description)
        sqlQuery += ' AND event_id LIKE ?)';
        queryParams.push(`%${event_id}%`);
    }

    // Add location filter
    if (venue_id) {
        // Use LIKE or exact match based on requirements
        sqlQuery += ' AND venue LIKE ?';
        queryParams.push(`%${venue_id}%`);
    }

    // Add date range filter
    if (start_date && end_date) {
        // Filter events that overlap with the selected range
        // The condition below checks if the event's date range (start_date, end_date) overlaps with the filter range
        sqlQuery += ' AND (event_end_date >= ? AND event_start_date <= ?)';
        queryParams.push(start_date, end_date);
    } else if (start_date) {
        // Filter events starting on or after a specific date
        sqlQuery += ' AND event_start_date >= ?';
        queryParams.push(start_date);
    }
    // You can add more date range conditions as needed (e.g., only upcoming events: 'event_end_date >= CURDATE()')

    // Execute the dynamic query using prepared statements for security
    connectionDB.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving events');
            return;
        }
        res.json(results);
    });
});


//start the server
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))

