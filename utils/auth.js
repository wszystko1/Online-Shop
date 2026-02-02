function authCheck(actualRole, requiredRole) {
    return actualRole === requiredRole;
};

module.exports = { authCheck };