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

module.exports = {
    groupOrders,
    formatDate
};