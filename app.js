
const express = require('express');
const path = require('path');
const session = require('express-session');
// const bodyParser = require('body-parser');

const usr_db = [
    {id: 1, username: 'Whistler', password: 'my voice is my password'}
];
const port = 3000;

const app = express();

app.use(session({
    secret: 'kjw534njksdfj',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60} // 1h
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'))

// app.use(bodyParser.urlencoded({
//     extended: true
// }));

// pewnie wysylanie json zamowien, ale tu sie upewnic

// zrozumiec czemu express.urlencoded działa
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/main', (req, res) => {
    res.redirect('/');
});

app.get('/product', (req, res) => {
    res.render('product.ejs');
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    console.log(req.body);
    const {username, password} = req.body;
    const user = usr_db.find(u => u.username==username && u.password==password);

    if(!user) {
        return res.status(401).json({message: 'Invalid credentials'});
    }

    req.session.user = {
        id: user.id,
        // id should be generated and saved in db - here is accessed
        username: user.username
    };

    // zrozumiec co tu sie dzieje
    res.json({message: 'Login successful', user: req.session.user});
});

// byloby spoko gdyby log out sie pokazalo po zalogowaniu
// przypomniec sobie req + zobaczyc te komunikaty, zrozumiec czym jest session
// moze dodac profile
// input type=submit zamiast button???
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})




