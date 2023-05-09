const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let cookiesObj;
    const { headers: { cookie } } = req;
    if (cookie) {
        const values = cookie.split(';')
            .reduce((total, item) => {
                const data = item.trim().split('=');
                return { ...total, [data[0]]: data[1] };
            }, {});
        cookiesObj = values;
    }
    console.log(cookiesObj);
    const token = cookiesObj.access_token;
    if (!token) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    // console.log(token);
    let decodeToken;
    try {
        decodeToken = jsonwebtoken.verify(token, 'dicoshop');
    } catch (error) {
        error.status = 500;
        throw error;
    }
    if (!decodeToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    req._id = decodeToken._id;
    req.role = decodeToken.role;
    console.log('isAuth', req._id, req.role);
    next();
}





