const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// app.get("/", (req, res) => {
//     res.send("Navch backend is running beeb");
// });

app.use(express.json());
app.use(express.static("../frontend"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "navch"
});

db.connect((err) => {
    if(err){
        console.log("Database connection failed: ", err);
        return;
    }

    console.log("MySQL connected!");
});

app.post("/lectures", (req, res) => {
    const { title, start_time, end_time, transcript } = req.body;

    const sql = `INSERT INTO lectures (title, start_time, end_time, transcript) VALUES (?, ?, ?, ?)`;

    db.query(
        sql,
        [title, start_time, end_time, transcript],
        (err, result) => {
            if(err){
                console.log(err);
                return res.status(500).json({ error: "Failed to save lecture"});
            }

            res.json({
                message: "Lecture saved!",
                id: result.insertID
            });
        }
    );
})

app.get("/lectures", (req, res) => {
    const sql = "SELECT * FROM lectures ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if(err){
            console.log(err);
            return res.status(500).json({ error: "Failed to fetch lectures" });
        }
        res.json(results);
    });

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});