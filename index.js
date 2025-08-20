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

let user = {
    loggedin: true,
    username: "kmab",
};

app.get("/", (req, res) => {
    res.render("index.ejs", {
        page: "dashboard.ejs",
        user: user,
    });
});

app.get("/about", (req, res) => {
    res.render("about.ejs", {
        user: user,
    });
});

app.get("/error", (req, res) => {
    res.render("error.ejs", {
        user: user,
    });
});

app.get("/login", (req, res) => {
    user = {
        loggedin: true,
        username: "kmab",
    };
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    user = {
        loggedin: false,
        username: "",
    };
    res.redirect("/");
});

app.all("*path", (req, res) => {
    res.redirect("/error");
});

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
})