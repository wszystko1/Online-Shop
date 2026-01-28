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

// DB
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'djfHDfndf',
  database: 'app_db'
}).promise();

// HTML 
const nav_notlogged_html = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <form class="nav-form" method="post" action="/search">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
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
            <form class="nav-form" method="post" action="/search">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="/cart">cart</a>
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
            <form class="nav-form" method="post" action="/search">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="/orders">orders</a>
                    <a class="nav-drop-link" href="/edit">edit</a>
                    <a class="nav-drop-link" href="/cart">cart</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                </div>
            </div>
        </div>
    </nav>
`;

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
                    <button class="submit-btn" type="submit" name="change" value="  ate">update</button>
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
};

// VIEWS NAVIGATION
app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/main', (req, res) => {
    res.redirect('/');
});


app.get('/load-prod-sq', async (req, res) => {
    const [productsList] = await pool.query(
        "SELECT * FROM products"
    );
    
    let prodSqHTML = '';
    for(product of productsList)
        prodSqHTML += `<div class="product-item">
            <a class="product-link" href="/product">
                <img class="product-image" src="${product.product_image}" width="300" height="300" alt="cactus image">
                <figcaption class="product-name">
                    ${product.product_name}
                </figcaption>
                <figcaption class="product-price">
                    ${product.product_price}
                </figcaption>
            </a>
        </div>`

    res.send(prodSqHTML);
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
};

async function getUsers(username, password) {
    const [rows] = await pool.query(
        "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
        [username, password]
    );
    if (rows.length !== 1) {
        return null;
    }
    return rows[0];
};

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUsers(username, password);    
    if (user) {
        req.session.userId = user.id;
        req.session.role = user.role;
        
        // TODO: add querry to db to add open
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
async function findUserByUsername(username) {
    const [rows] = await pool.query(
        "SELECT id, username, password, role FROM users WHERE username = ?",
        [username]
    );
    return rows.length > 0
};

async function addUser(username, password){
    const result = await pool.query('insert into users (username, password, role) values (?,?,?)', [username, password, "user"]);
   return result;
};

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

app.get('/load-prod-list', async (req, res) => {
    if(auth_check(req.session.role, 'admin')) {
        try {
            const rows = await pool.query('SELECT * FROM products');
            productList = rows[0];
            prodListHTML = createProdListHTML(productList); 
            res.send(prodListHTML);        
        } catch (err) {
            // res.status(500).json({ error: 'Failed to fetch products' });
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

function formatDate(date) {
    return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

// CARD
app.get('/cart', (req, res) => {
    res.render('cart.ejs');
});

app.post('/update-cart', (req, res) => {
    // TODO: check max quantity in DB & if requested is over it react with some browser message

    if(!req.session.cart) {
        req.session.cart = [];   
    }
    req.session.cart.push(req.body);
    res.sendStatus(200);
});

async function getUserOrders(userId) {
    const [rows] = await pool.query(
        `SELECT * FROM orders_list WHERE user_id = ? ORDER BY order_date DESC`,
        [userId]
    );
    return groupOrders(rows);
}

app.get('/load-cart', async (req, res) => {
    let ordersListHTML = `<tr>
            <th>orderID</th>    
            <th>user_id</th>
            <th>products</th>
            <th>quantity</th>
            <th>date</th>    
            <th>paid</th>    
        </tr>`;

    const user_db = await getUserOrders(req.session.userId);

    for(const order of user_db) {
        const orderHTML = `<tr>
            <td>${order.order_id}</td>
            <td>${order.user_id}</td>
            <td>${order.items.map(item => item.product_id).join(', ')}</td> 
            <td>${order.items.map(item => item.product_id + ' (x' + item.quantity + ')').join(', ')}</td>
            <td>${formatDate(order.order_date)}</td>
            <td>${order.paid}</td>
        </tr>`;
        ordersListHTML += orderHTML;
    }

    res.send(ordersListHTML);
});	

// EDIT VIEW
app.get('/edit', (req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        res.render('edit.ejs');
    } else {
        res.status(403).send('Forbidden');
    }
});

app.post('/edit', async (req, res) => {
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

app.post('/search', (req, res) => {
    console.log(req.body);
    const searchQuery = req.body.searchQuery;
    // here DB querry with LIKE
    let products;
    // products = ..
    productList = rows[0];
    prodListHTML = createProdTilesHTML(productList);
    res.send(prodListHTML); 
});

app.post('/search', (req, res) => {
    const searchQuery = req.body.searchQuery;
    // const products = // here DB querry with LIKE
});


// ORDERS
function groupOrders(rows) {
    const ordersMap = new Map();

    for (const row of rows) {
        if (!ordersMap.has(row.order_id)) {
            ordersMap.set(row.order_id, {
                order_id: row.order_id,
                user_id: row.user_id,
                order_date: row.order_date,
                paid: row.paid,
                items: [] 
            });
        }

        const order = ordersMap.get(row.order_id);
        order.items.push({
            product_id: row.product_id, 
            quantity: row.quantity
        });
    }

    return Array.from(ordersMap.values());
}

async function getAllOrders() {
    const [rows] = await pool.query(
        `SELECT * FROM orders_list`
    );

    return groupOrders(rows);
};

app.get('/orders', async(req, res) => {
    if(req.session.role == 'admin') {
        res.render('orders.ejs');
    } else {

    }
});

app.get('/orders-list', async (req, res) => {
    if (auth_check(req.session.role, 'admin')) {
        let ordersListHTML = `<tr>
            <th>orderID</th>    
            <th>user_id</th>
            <th>products</th>
            <th>quantity</th>
            <th>date</th>    
            <th>paid</th>    
        </tr>`;

        const orders_db = await getAllOrders();
        
        for(const order of orders_db) {
            const orderHTML = `<tr>
                <td>${order.order_id}</td>
                <td>${order.user_id}</td>
                <td>${order.items.map(item => item.product_id).join(', ')}</td> 
                <td>${order.items.map(item => item.product_id + ' (x' + item.quantity + ')').join(', ')}</td>
                <td>${formatDate(order.order_date)}</td>
                <td>${order.paid}</td>
            </tr>`;
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