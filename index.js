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

let config = {
    user: {
        loggedin: true,
        username: "kmab",
    },
    order: 'date',
    book: '',
    error: false,
};

// Library page (bookshelf with cover pics, sort w/ rating/recency(modified not added), add new books)
// Favorites page (library duplicate with filter)
// Login/Sign up page (username + password)
// Book display/add note page (Progress indicator, ratings giver, favorite)
// Add book page (search and choose/custom fill out)

app.get("/", (req, res) => {
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "dashboard.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs", {
        config: config,
    });
});

app.get("/library", (req, res) => {
    if(config.user.loggedin) {
        config.order = req.query.order || 'date';
        res.render("index.ejs", {
            page: "library.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/favorites", (req, res) => {
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "favorites.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/book/:id", (req, res) => {
    if(config.user.loggedin) {
        let book = {};
        config.book = book;
        res.render("index.ejs", {
            page: "book.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/new", (req, res) => {
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "new.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("signin.ejs", {
        config: config,
    });
});

app.post("/login", (req, res) => {
    config.error = true;
    if(!config.error) {
        config.user = {
            loggedin: true,
            username: "kmab",
        };
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    if(config.user.loggedin) {
        config.user = {
            loggedin: false,
            username: "",
        };
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

app.get("/error", (req, res) => {
    res.render("error.ejs", {
        config: config,
    });
});

app.all("*path", (req, res) => {
    res.redirect("/error");
});

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
})