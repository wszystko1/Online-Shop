// IMPORTS

const express = require('express');
const path = require('path');
const session = require('express-session');

// SETUP
const port = 3000;
const app = express();

app.use(session({
    secret: 'kjw534njksdfj',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        // secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 100 * 60 * 60
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

// CONST VARIABLES

const nav_html_basic = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <input class="nav-search" type="text" placeholder="Search.." inputmode="search">
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/login">Log in</a>
        </div>
    </nav>
`

const nav_html_logged = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <input class="nav-search" type="text" placeholder="Search.." inputmode="search">
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="">change</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                    <a class="nav-drop-link" href="/basket">basket</a>
                </div>
            </div>
        </div>
    </nav>
`
const usr_db = [
    {id: 1, username: 'max', password: '1234', role: 'admin'},
    {id: 1, username: 'alex', password: '1234', role: 'user'}
];

// DYNAMIC ELEMENTS

app.get('/load-nav', (req, res) => {
    res.header("Content-Type",'application/json');
    if(req.session.userId) {
        res.send(nav_html_logged);
    } else {
        res.send(nav_html_basic);
    }
});

// VIEWS NAVIGATION

app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/main', (req, res) => {
    res.redirect('/');
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/product', (req, res) => {
    res.render('product.ejs');
});

// LOGIN & AUTHENTICATION

app.get('/log-out', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            // TODO: think of a better sollution
            return res.status(500).json({message: 'Logout failed!'});
        }
        // res.json({message: 'Logged out successfully!'});
    });
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = usr_db.find(u => u.username===username && u.password===password);
    
    if(!user) {
        return res.status(401).json({message: 'Invalid credentials'});
    }
    
    req.session.cart = req.session.cart || [];
    req.session.userId = user.id;
    req.session.role = user.role;
    // req.session.csrfToken =    

    req.session.save(err => {
        if(err) return next(err);
        res.redirect('/');
    });
});

// ACCOUNT CREATION

app.get('/create-account', (req, res) => {
    res.render('create-account.ejs');
});

app.post('/create-account', (req, res) => {
    const {username, password} = req.body;
    // TODO: add to real DB

    next_id = Object.keys(usr_db).length + 1;
    usr_db.push({id: next_id, 'username': username, 'password': password});
    res.redirect('/login');
});

// BASKET + CARD

app.get('/basket', (req, res) => {
    // TODO: add price based on data from DB and quantity
    // TODO: apply check for available quantity one more time
    res.render('basket.ejs');
});

app.post('/cart', (req, res) => {
    // TODO: check max quantity in DB & if requested is over it react with some browser message
    if(!req.session.cart) {
        req.session.cart = [];   
    }
    req.session.cart.push(req.body);
    console.log(req.session.cart);
    // res.json(req.session.cart);
    res.sendStatus(200);
});

// SERVER

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something weng wrong!');
});

// app.get("/check", (req, res) => {
//     res.header("Content-Type",'application/json');
//     if(req.session.id) {
//         res.send(JSON.stringify(true));
//     } else {
//         res.send(JSON.stringify(false));
//     }
// });

