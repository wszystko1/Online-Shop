// IMPORTS
const express = require('express');
const path = require('path');
const session = require('express-session');

// SETUP
const port = 3000;
const app = express();

// SESSION
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

// IMPORT MODULES
const { authCheck } = require('./utils/auth.js');
const {
    getUsers,
    getMaxId,
    getUserOrders,
    getAllOrders,
    findUserByUsername,
    addUser,
    getProductId,
    quantityByName,
    cart2Order,
    getAllUsers
} = require('./utils/query.js')(pool);

const {
    nav_notlogged_html,
    nav_admin_html,
    nav_logged_html,
    createProdGrid,
    createProdListHTML
} = require('./utils/html.js');

const {
    groupOrders,
    formatDate
} = require('./utils/tmp.js');

// MIDDLEWARE
app.get('/', (req, res) => {
    res.render('main.ejs');
});formatDate

app.get('/main', (req, res) => {
    res.redirect('/');
});

app.get('/product', async (req, res) => {
    const product_name = req.query.name;
    const [rows] = await pool.query(
        `SELECT * FROM products WHERE product_name = ?`,
        [product_name]
    );

    res.render('product.ejs', {product: rows[0]});
});

app.get('/load-prod-sq', async (req, res) => {
    const [productsList] = await pool.query(
        "SELECT * FROM products"
    );
    
    const prodSqHTML = createProdGrid(productsList)
    res.send(prodSqHTML);
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUsers(username, password);    
    if (user) {
        req.session.userId = user.id;
        req.session.role = user.role;
        res.redirect('/main');
    } else {
        return res.render('login.ejs', { error: 'Bad login or password' });
    }
});

app.get('/log-out', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.status(500).json({message: 'Logout failed!'});
        }
        // res.json({message: 'Logged out successfully!'});
    });
    res.redirect('/');
});

app.get('/create-account', (req, res) => {
     res.render('create-account.ejs');
});

app.post('/create-account', async (req, res) => {
    const {username, password} = req.body;
    const userExists = await findUserByUsername(username);

    if(userExists){
        res.render('create-account.ejs', { error: 'Username already taken' });
    }
    else{
        await addUser(username, password); 
        res.redirect('/login');
    }
});

app.get('/load-nav', (req, res) => {
    if (authCheck(req.session.role, 'admin')) {
        res.send(nav_admin_html);
    } else if(authCheck(req.session.role, 'user')) {
        res.send(nav_logged_html);
    } else {
        res.send(nav_notlogged_html);
    }
});

app.get('/load-prod-list', async (req, res) => {
    if(authCheck(req.session.role, 'admin')) {
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

app.get('/cart', (req, res) => {
    res.render('cart.ejs');
});

app.post('/update-cart', async (req, res) => {
    let quantityOrdered = parseInt(req.body.productQuantity);
    const productName = req.body.productName;
    const quantityMax = await quantityByName(productName);

    if (quantityMax === null) {
        return res.status(404).send("Product not found");
    }
    if (quantityMax < quantityOrdered) {
        return res.status(400).send("Not enough stock"); 
    } else {
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItem = req.session.cart.find(item => item.productName === productName);

        if (existingItem){
            existingItem.quantityOrdered += Number(quantityOrdered);
        }
        else {
            req.session.cart.push({productName, quantityOrdered: Number(quantityOrdered)});
        }

        return res.sendStatus(200);
    }
});

app.get('/load-cart', (req, res) => {
    let html = `<tr>
            <th>product name</th>
            <th>quantity</th>
        </tr>`;

    if(!req.session.cart) {
        return res.send(html);
    }

    for (let i = 0; i < req.session.cart.length; i++) {
        html += `
            <tr>
                <td>${req.session.cart[i].productName}</td>
                <td>${req.session.cart[i].quantityOrdered}</td>
            </tr>`;
    }

    res.send(html);
});	

app.get('/edit', (req, res) => {
    if (authCheck(req.session.role, 'admin')) {
        res.render('edit.ejs');
    } else {
        res.status(403).send('Forbidden');
    }
});

app.post('/edit', async (req, res) => {
    if (authCheck(req.session.role, 'admin')) {
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

async function searchDB(search){
    const [rows] = await pool.query(
        `SELECT * FROM products 
         WHERE product_name LIKE ? 
         OR product_desc LIKE ?`,
        [`%${search}%`, `%${search}%`] 
    );
    return rows;
}

app.post('/search', async (req, res) => {
    const searchQuery = req.body.searchQuery;
    const productsList = await searchDB(searchQuery);
    const prodSqHTML = createProdGrid(productsList)
    res.send(prodSqHTML); 
});

app.get('/orders', async(req, res) => {
    if(req.session.role == 'admin') {
        res.render('orders.ejs');
    } else {

    }
});

app.get('/orders-list', async (req, res) => {
    if (authCheck(req.session.role, 'admin')) {
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

app.get('/users-list', async (req, res) => {
    if (auth_check(req.session.role, 'admin')) {

        const users = await getAllUsers();

        let usersListHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; max-width: 800px; }
                th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
                tr:hover { background-color: #f5f5f5; }
            </style>
        </head>
        <body>
            <h2>User List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>    
                        <th>Username</th>
                        <th>Password (Hash)</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>`;

        for (const user of users) {
            const userHTML = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.password}</td> 
                    <td>${user.role}</td>
                </tr>`;
            
            usersListHTML += userHTML;
        }

        usersListHTML += `
                </tbody>
            </table>
        </body>
        </html>`;
        
        res.send(usersListHTML);

    } else {
        res.status(403).send('Forbidden');
    }    
});


app.post('/buy', async (req, res) => {
    await cart2Order(req);
    req.session.cart = [];
    res.redirect('/cart');
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

