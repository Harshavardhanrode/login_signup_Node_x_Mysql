const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "",   //Enter your password
    database: "login_signup"
});

try {
    db.connect(err => {
        if (err) {
            console.error("Database connection failed:", err.message); 
                    //process.exit(1); // Exit the application if DB connection fails
        } else {
            console.log("Connected to MySQL Database.");
        }
    });
} catch (error) {
    console.error("Unexpected error while connecting to DB:", error.message);
            // process.exit(1); // Exit the process
    }

app.post("/signup", async (req, res) => {
    const { name, email, dob, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, dob, password, phone) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, email, dob, hashedPassword, phone], (err, result) => {
        if (err) return res.status(500).json({ error: "User already exists or invalid input" });
        res.status(201).json({ message: "User registered successfully"});
    });
});



app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if(email === "admin@123" && password ==="admin" ){
        return res.json({ message: " Default Login successful", username:"admin" });   // default login without database
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);  //bcrypt.compare() compares a plain text password with a hashed password stored in the database.

        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ username: user.name }, "secretkey", { expiresIn: "1h" });  //jwt.sign() is a function from the jsonwebtoken library that creates a JWT token.
        res.json({ message: "Login successful", token, username:user.name });
    });
});


app.get("/login",(req,res)=>{
    res.redirect("login.html");
})

app.get("/signup",(req,res)=>{
    res.redirect("signup.html");
})



app.listen(5000, () => {
    console.log("Server running on port 5000");
});
