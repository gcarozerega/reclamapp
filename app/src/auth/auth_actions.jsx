var authConfig = require('./config.json');
const jwt = require('jsonwebtoken');

export function isAuthenticated(token){
    try{
        jwt.verify(token,authConfig.jwtSecret)
    } catch(err){
        return false
    }
    return true
}

export function verify_permissions(token,permission){
    try{
        var decoded = jwt.verify(token,authConfig.jwtSecret);
    } catch(err){
        return false;
    }
    
    let permissions = decoded.data.permissions;
    return permissions.findIndex(p => p==permission) != -1;
    
}

export function get_user_data(token,callback){
    jwt.verify(token,authConfig.jwtSecret,function(err,decoded){
        let response = {};
        if(!err){
            response = {
                email: decoded.data.email,
                name: decoded.data.name,
                last_name: decoded.data.last_name
            }
            callback(response)
        } else {
            callback(response)
        }
    })
}