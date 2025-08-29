import express from "express";
import axios from "axios";
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
    order: 'modified',
    book: {},
    notes: [],
    error: false,
};

app.get("/", async (req, res) => {
    if(config.user.loggedin) {
        // dashboard info query
        let last = {
            note_err: false,
            book_err: false,
            recent: [],
        };
        try {
            const result = await db.query("SELECT * FROM books WHERE user_id = ($1) ORDER BY modified desc", [config.user.id]);
            const note_result = await db.query("SELECT * FROM notes n JOIN books b ON n.book_id = b.id AND b.user_id = ($1) ORDER BY n.date desc", [config.user.id]);
            if (note_result.rows.length > 0) {
                last = {
                    id: note_result.rows[0].book_id,
                    title: note_result.rows[0].book_name,
                    olid: note_result.rows[0].olid,
                    note: {
                        id: note_result.rows[0].id,
                        note: note_result.rows[0].note,
                        date: note_result.rows[0].date,
                        page: note_result.rows[0].page,
                    },
                };
            } else last.note_err = true;
            if(result.rows.length > 0) {
                last.recent = [];
                for (let i = 0; i < 5; i++) {
                    if (i >= result.rows.length) break;
                    last.recent.push({
                        id: result.rows[i].id,
                        title: result.rows[i].book_name,
                        olid: result.rows[i].olid,
                    });
                }
            } else last.book_err = true;
        } catch (err) {
            console.log(`error occured when loading dashboard (/): ${err}`);
        }
        res.render("index.ejs", {
            page: "dashboard.ejs",
            config: config,
            last: last,
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

app.get("/library", async (req, res) => {
    if(config.user.loggedin) {
        config.order = req.query.order || 'modified';
        // query for user books
        let books = [];
        try {
            const result = await db.query("SELECT * FROM books WHERE user_id = ($1) ORDER BY ($2) desc", [config.user.id, config.order]);
            books = result.rows;
        } catch (err) {
            console.log(`error occured when retrieving library (/library): ${err}`);
        }
        res.render("index.ejs", {
            page: "library.ejs",
            config: config,
            books: books,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/favorites", async (req, res) => {
    if(config.user.loggedin) {
        // query for user's favorite books
        let books = [];
        try {
            const result = await db.query("SELECT * FROM books WHERE user_id = ($1) AND favorite = true", [config.user.id]);
            books = result.rows;
        } catch (err) {
            console.log(`error occured when retrieving favorites (/favorites): ${err}`);
        }
        res.render("index.ejs", {
            page: "favorites.ejs",
            config: config,
            books: books,
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/book/:id", async (req, res) => {
    if(config.user.loggedin) {
        // query for notes
        let notes = [];
        let book = {};
        try {
            const book_res = await db.query("SELECT * FROM books WHERE user_id = ($1) AND id = ($2)", [config.user.id, req.params.id]);
            const notes_res = await db.query("SELECT n.id, n.note, n.page, n.date FROM notes n JOIN books b ON b.id = n.book_id WHERE b.user_id = ($1) AND b.id = ($2) ORDER BY n.date desc", [config.user.id, req.params.id]);
            book = {
                id: book_res.rows[0].id,
                title: book_res.rows[0].book_name,
                added: book_res.rows[0].added,
                modified: book_res.rows[0].modified,
                progress: book_res.rows[0].progress,
                rating: book_res.rows[0].rating,
                favorite: book_res.rows[0].favorite,
                olid: book_res.rows[0].olid,
                user_id: book_res.rows[0].user_id,
            };
            notes_res.rows.forEach(row => {
                notes.push({
                    id: row.id,
                    note: row.note,
                    date: row.date,
                    page: row.page,
                });
            });
        } catch (err) {
            console.log(`error occured when retrieving book (/book): ${err}`);
        }
        config.notes = notes;
        config.book = book;
        res.render("index.ejs", {
            page: "book.ejs",
            config: config,
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/update", async (req, res) => {
    // update anything from the book page: new note, edit note, delete note, edit favorite, edit rating
    if(config.user.loggedin) {
        let id = req.body.id.slice(1);
        if(req.body.id.slice(0,1) == "b") {
            let new_info = {
                progress: req.body.progress,
                rating: req.body.rating,
                favorite: req.body.favorite == 'true' ? true : false,
                modified: new Date().toISOString().replace('T',' ').split('.')[0],
            };
            try {
                const result = await db.query("UPDATE books SET progress = ($1), rating = ($2), favorite = ($3), modified = ($4) WHERE id = ($5)", [new_info.progress, new_info.rating, new_info.favorite, new_info.modified, id]);
                console.log(`Updated book with id ${id}!`);
            } catch (err) {
                console.log(`error occured when updating book (/update): ${err}`);
            }
        } else {
            id = req.body.id.split("b")[1];
            let note_id = req.body.id.split("b")[0].slice(1);
            if (req.body.mode == "save") {
                let new_info = {
                    note: req.body.note,
                    date: new Date().toISOString().replace('T',' ').split('.')[0],
                };
                try {
                    const result = await db.query("UPDATE notes SET note = ($1), date = ($2) WHERE id = ($3)", [new_info.note, new_info.date, note_id]);
                    const book_result = await db.query("UPDATE books SET modified = ($1) WHERE id = ($2)", [new_info.date, id]);
                    console.log(`Updated note with id ${note_id}!`);
                } catch (err) {
                    console.log(`error occured when updating note (/update): ${err}`);
                }
            } else if (req.body.mode == "del") {
                try {
                    const result = await db.query("DELETE FROM notes WHERE id = ($1)", [note_id]);
                    const book_result = await db.query("UPDATE books SET modified = ($1) WHERE id = ($2)", [new Date().toISOString().replace('T',' ').split('.')[0], id]);
                    console.log(`Deleted note with id ${note_id}!`);
                } catch (err) {
                    console.log(`error occured when deleting note (/update): ${err}`);
                }
            } else {
                // new note
                let new_info = {
                    note: req.body.note,
                    page: parseInt(req.body.page),
                    date: new Date().toISOString().replace('T',' ').split('.')[0],
                };
                let new_progress = new_info.page > config.book.progress ? new_info.page : config.book.progress;
                try {
                    const result = await db.query("INSERT INTO notes (note, date, page, book_id) VALUES ($1, $2, $3, $4) RETURNING id", [new_info.note, new_info.date, new_info.page, id]);
                    const book_result = await db.query("UPDATE books SET modified = ($1), progress = ($2) WHERE id = ($3)", [new_info.date, new_progress, id]);
                    note_id = result.rows[0].id;
                    console.log(`Added note with id ${note_id}!`);
                } catch (err) {
                    console.log(`error occured when deleting note (/update): ${err}`);
                }
            }
        }
        res.redirect(`/book/${id}`);
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

app.post("/add", async (req, res) => {
    if(req.body.name.length == 0) return res.redirect("/add");
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${req.body.name}`);
        let result = response.data;
        if(config.user.loggedin) {
            res.render("index.ejs", {
                page: "new.ejs",
                config: config,
                result: result,
            });
        } else {
            res.redirect("/login");
        }
    } catch (err) {
        console.log(`error occured when looking up search (/add): ${err}`);
        res.redirect("/add");
    }
});

app.post("/new", async (req, res) => {
    if(config.user.loggedin) {
        let book = JSON.parse(req.body.book);
        config.book = {
            id: 0,
            title: book.title,
            added: new Date().toISOString().replace('T',' ').split('.')[0],
            modified: new Date().toISOString().replace('T',' ').split('.')[0],
            progress: 0,
            rating: 0,
            favorite: false,
            olid: book.key.split("/")[2],
            user_id: config.user.id,
        };
        try {
            const result = await db.query("INSERT INTO books (book_name, added, modified, progress, rating, favorite, olid, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id", [config.book.title, config.book.added, config.book.modified, config.book.progress, config.book.rating, config.book.favorite, config.book.olid, config.book.user_id]);
            config.book.id = result.rows[0].id;
            res.redirect(`/book/${config.book.id}`);
        } catch (err) {
            console.log(`error occured when adding book (post /new): ${err}`);
            if(err == 'error: duplicate key value violates unique constraint "books_olid_user_id_key"') {
                const result = await db.query("SELECT id FROM books WHERE olid = ($1) AND user_id = ($2)", [config.book.olid, config.book.user_id]);
                config.book.id = result.rows[0].id;
                res.redirect(`/book/${config.book.id}`);
            } else res.redirect("/add");
        }
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
        const result = await db.query("SELECT id, username FROM users WHERE username = ($1) AND password = ($2)", [req.body.name.toLowerCase(), req.body.pass]);
        let user = {
            loggedin: false,
            username: "",
            id: 0,
        };
        if (result.rows.length == 0) {
            const newuser = await db.query("SELECT * FROM users WHERE username = ($1)", [req.body.name.toLowerCase()]);
            if (newuser.rows.length == 0) {
                const prompt = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username", [req.body.name.toLowerCase(), req.body.pass]);
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