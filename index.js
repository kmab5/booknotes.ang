import express from "express";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: "postgres",
    database: "booknotes",
    password: "Km@b5ami",
    host: "localhost",
    port: 5432
});

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/error", (req, res) => {
  res.render("error.ejs");
});

app.all("*path", (req, res) => {
  res.redirect("/error");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})