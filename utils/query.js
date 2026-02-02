const { groupOrders, formatDate } = require('./tmp.js');

module.exports = (pool) => {

    async function getUsers(username, password) {
        const [rows] = await pool.query(
            "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
            [username, password]
        );
        return rows.length === 1 ? rows[0] : null;
    }

    async function getMaxId() {
        const [rows] = await pool.query(
            "SELECT MAX(order_id) as maxVal FROM orders_list"
        );
        return rows[0].maxVal || 0;
    }

    async function getUserOrders(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM orders_list WHERE user_id = ? ORDER BY order_date DESC`,
            [userId]
        );
        return groupOrders(rows);
    }

    async function getAllOrders() {
        const [rows] = await pool.query(
            `SELECT * FROM orders_list`
        );
        return groupOrders(rows);
    }

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

    
    async function getProductId(productName){
        const result =  await pool.query("SELECT product_id FROM products WHERE product_name = ?",[productName]);
        return result[0][0].product_id;
    }

    async function quantityByName(productName) {
        const [rows] = await pool.query(
                "SELECT product_quantity FROM products WHERE product_name = ?",
                [productName]
            );
        if (rows.length === 0) {
            return null;
        }
        return rows[0].product_quantity;
    }

    async function cart2Order(req) {
        const cart = req.session.cart;
        
        if (!cart || cart.length === 0) return;
    
        const currentMaxId = await getMaxId();
        const newOrderId = currentMaxId + 1;
        const orderDate = new Date().toISOString().slice(0, 10);
    
        for (const item of cart) {
            const maxQuantity = await quantityByName(item.productName);
            const prodID = await getProductId(item.productName);
    
            await pool.query(
                `INSERT INTO orders_list (order_id, user_id, product_id,quantity, order_date, paid) 
                 VALUES (?, ?, ?,?, ?,?)`,
                [
                    newOrderId,
                    req.session.userId, 
                    prodID, 
                    item.quantityOrdered, 
                    orderDate,
                    'no'
                ]
            );
    
            await pool.query(
                `UPDATE products SET product_quantity = ? WHERE product_name = ?`,
                [
                    maxQuantity-item.quantityOrdered,
                    item.productName
                ]
            );
        }
        return newOrderId;
    };

    async function getAllUsers(){
        const [rows] = await pool.query(`SELECT * FROM users`);
        
        return rows; 
    }

    return {
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
    };
};
