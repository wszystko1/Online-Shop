const { groupOrders } = require('./tmp.js');

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

    return {
        getUsers,
        getMaxId,
        getUserOrders,
        getAllOrders
    };
};
