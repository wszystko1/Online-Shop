function auth_check(actualRole, requiredRole) {
    return actualRole === requiredRole;
};

module.exports = { auth_check };