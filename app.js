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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DATABASES
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'online_shop'
}).promise();


// REGISTRATION
 async function addUser(username, password){
   const result = await pool.query('insert into users (username, password, role) values (?,?,?)',
      [username, password, "user"]);
   return result;
}

// LOGIN 
async function getUsers(username, password) {
    const [rows] = await pool.query(
        "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
        [username, password]
    );
    
    if (rows.length !== 1) {
        return null;
    }
    
    return rows[0];
}

async function findUserByUsername(username) {
    const [rows] = await pool.query(
        "SELECT id, username, password, role FROM users WHERE username = ?",
        [username]
    );

    if (rows.length === 0){
        return false;
    }

    return true;
}

// CONST VARIABLES
const nav_notlogged_html = `
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
`;

const nav_logged_html = `
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
                    <a class="nav-drop-link" href="/basket">basket</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                </div>
            </div>
        </div>
    </nav>
`;

const nav_admin_html = `
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
                    <a class="nav-drop-link" href="/orders">orders</a>
                    <a class="nav-drop-link" href="/edit">edit</a>
                    <a class="nav-drop-link" href="/basket">basket</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                </div>
            </div>
        </div>
    </nav>
`;

// DYNAMIC ELEMENTS
app.get('/load-nav', (req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        res.send(nav_admin_html);
    } else if(auth_check(req.session.role, 'user')) {
        res.send(nav_logged_html);
    } else {
        res.send(nav_notlogged_html);
    }
});

function createProdListHTML(productList) {
    let listInnerHTML = "";
    for(let i = 0; i < productList.length; i++) {
        listInnerHTML += `
        <div class="product">
            <form method="post" >
            <div class="form-grid">
            <div class="form-header">feature</div>
            <div class="form-header">edit</div>
            <label>id</label>
            <input type="text" name="id" value="${productList[i].product_id}" readonly/>
            <label>name</label>
            <input type="text" name="name" value="${productList[i].product_name}"/>

            <label>description</label>
            <input type="text" name="desc" value="${productList[i].product_desc}"/>

            <label>price</label>
            <input type="text" name="price" value="${productList[i].product_price}"/>

            <label>image</label>
            <input type="file" name="image" accept="image/png, image/jpeg"/>
            </div>
                <div class="submit-block">
                    <button class="submit-btn" type="submit" name="change" value="update">update</button>
                    <button class="submit-btn" type="submit" name="change" value="remove">remove</button>
                </div>
            </form>
        </div>`;
    }

    listInnerHTML += `
        <div class="product">
            <form method="post" >
                <div class="form-grid">
                    <div class="form-header">feature</div>
                    <div class="form-header">add</div>
                    
                    <label>id</label>
                    <input type="text" name="id" value=""/>

                    <label>name</label>
                    <input type="text" name="name" value=""/>

                    <label>description</label>
                    <input type="text" name="desc" value=""/>

                    <label>price</label>
                    <input type="text" name="price" value=""/>

                    <label>image</label>
                    <input type="file" name="image" accept="image/png, image/jpeg">
                </div>
                <div class="submit-block">
                    <button class="submit-btn" type="submit" name="change" value="add">add</button>
                </div>
            </form>
        </div>`;
    return listInnerHTML
}

app.get('/load-prod-list', async (req, res) => {
    // add auth_check
    try {
        const rows = await pool.query('SELECT * FROM products');
        productList = rows[0];
        prodListHTML = createProdListHTML(productList); 
        res.send(prodListHTML);        
    } catch (err) {
        // res.status(500).json({ error: 'Failed to fetch products' });
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
function auth_check(actualRole, requiredRole) {
    return actualRole === requiredRole;
}

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUsers(username, password);    
    console.log(user);
    if (user) {
        req.session.userId = user.id;
        req.session.role = user.role;
        res.redirect('/main');
    } else {
        // check if this works
        return res.render('login.ejs', { error: 'Bad login or password' });
    }
});

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

// ACCOUNT CREATION
app.get('/create-account', (req, res) => {
     res.render('create-account.ejs');
});

app.post('/create-account', async (req, res) => {
    const {username, password} = req.body;

    const userExists = await findUserByUsername(username);

    if(userExists){
        console.log('This username is already in use');
        res.render('create-account.ejs', { error: 'Username already taken' });
    }
    else{
        await addUser(username, password); 
        res.redirect('/login');
    }
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
    res.sendStatus(200);
});

// EDIT VIEW
app.get('/edit', (req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        res.render('edit.ejs');
    } else {
        res.status(403).send('Forbidden');
    }
});

app.post('/edit', async(req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        const edit = req.body;
        let sql;
        if(edit.change === 'update') {
            sql = `UPDATE products
                SET product_name = '${edit.name}', product_desc = '${edit.desc}', product_image = '${edit.image}', product_price = ${edit.price}
                WHERE product_id = ${edit.id}`; 
            await pool.query(sql);
            res.redirect('/edit');
        } else if(edit.change === 'remove') {
            sql = `DELETE FROM products
                WHERE product_id = ${edit.id}`;
            await pool.query(sql);
            res.redirect('/edit');
        } else if(edit.change === 'add') {
            sql = `INSERT INTO products
                VALUES (${edit.id}, '${edit.name}', '${edit.desc}', '${edit.image}', ${edit.price})`;
            await pool.query(sql);
            res.redirect('/edit');
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

// ORDER VIEW 
const orders_db = [
    {
        orderID: 1,
        is_logged: 'yes',
        username: 'max',
        order: [['cactus_big', 3], ['cactus_small', 1]],
        price: 250
    },
    {
        orderID: 2,
        is_logged: 'no',
        username: '',
        order: [['cactus_big', 3], ['cactus_small', 1]],
        price: 250
    },
    {
        orderID: 3,
        is_logged: 'no',
        username: '',
        order: [['cactus_big', 3]],
        price: 250
    }
];

app.get('/orders', (req, res) => {
    if(req.session.role == 'admin') {
        res.render('orders.ejs');
    } else {

    }
});

app.get('/orders-list', (req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        let ordersListHTML = `<tr>
            <th>orderID</th>    
            <th>is_logged</th>    
            <th>username</th>    
            <th>order</th>    
            <th>price</th>    
        </tr>`;
        for(const order of orders_db) {
            const orderHTML = `<tr>
                <td>` + order.orderID + `</td>
                <td>` + order.is_logged + `</td>
                <td>` + order.username + `</td>
                <td>` + order.order.map(pair => pair.join(',')).join('; ') + `</td>
                <td>` + order.price  + `</td>
            </tr>`
            ordersListHTML += orderHTML;
        }
        res.send(ordersListHTML);
    } else {
        res.status(403).send('Forbidden');
    }    
});

// SERVER
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});