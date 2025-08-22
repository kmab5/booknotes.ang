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
        loggedin: false,
        username: "",
        id: 0,
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

// add "add" buttons on search page books - done
// make all book titles links
// find a way(route) to add new books - /new

// Date format - new Date().toISOString().replace('T',' ').split('.')[0]

// https://openlibrary.org/developers/api
// https://covers.openlibrary.org/b/$key/$value-$size.jpg - https://openlibrary.org/dev/docs/api/covers
// https://openlibrary.org/search.json?q=harry%20potter - http://openlibrary.org/dev/docs/api/search

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
        let book = {
            title: "Harry Potter",
            added: "20250712UTC",
            modified: "20250712UTC",
            progress: 15,
            pages: 500,
            rating: 4,
            notes: [
                {
                    date: "20250712UTC",
                    page: 12,
                    note: "",
                },
            ],
        };
        config.book = book;
        res.render("index.ejs", {
            page: "book.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/add", (req, res) => {
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "new.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/add", (req, res) => {
    let result = [req.body.name];
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "new.ejs",
            config: config,
            result: result,

        });
    } else {
        res.redirect("/login");
    }
});

app.post("/new", (req, res) => {
    let result = [req.body.olid];
    if(config.user.loggedin) {
        res.render("index.ejs", {
            page: "new.ejs",
            config: config,
            result: result,

        });
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    if(!config.user.loggedin){
        res.render("signin.ejs", {
            config: config,
        });
    } else {
        res.redirect("/");
    }
});

app.post("/login", async (req, res) => {
    try {
        const result = await db.query("SELECT id, username FROM users WHERE username = ($1) AND password = ($2)", [req.body.name, req.body.pass]);
        let user = {
            loggedin: false,
            username: "",
            id: 0,
        };
        if (result.rows.length == 0) {
            const newuser = await db.query("SELECT * FROM users WHERE username = ($1)", [req.body.name]);
            if (newuser.rows.length == 0) {
                const prompt = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username", [req.body.name, req.body.pass]);
                console.log(prompt.rows[0].username);
                user = {
                    loggedin: true,
                    username: prompt.rows[0].username,
                    id: parseInt(prompt.rows[0].id),
                };
            } else {
                throw new Error();
            }
        } else {
            user = {
                loggedin: true,
                username: result.rows[0].username,
                id: parseInt(result.rows[0].id),
            };
        }
        config.user = user;
    } catch (err) {
        config.error = true;
        console.log(`error occured when loggin in: ${err}`);
    }
    if(!config.error) {
        console.log(`User ${config.user.username} successfully logged in.`);
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    if(config.user.loggedin) {
        console.log(`User ${config.user.username} successfully logged out.`);
        config.user = {
            loggedin: false,
            username: "",
            id: 0,
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