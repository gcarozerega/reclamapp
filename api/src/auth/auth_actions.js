var crypto = require('crypto');
var authConfig = require('./config');
const jwt = require('jsonwebtoken');

function generate_token(data,callback){
    if(callback){
        let token = jwt.sign(
            {
                data:data,
            }, authConfig.jwtSecret,{expiresIn:'24h'} ,function(err,token){
                callback(token);
            }
        )
    }
}

function isAuthenticated(token,callback){
    jwt.verify(token,authConfig.jwtSecret,function(err,decoded){
        if(err){
            callback(false,err)
        } else {
            callback(true,{})
        }
    })
}

function verify_permissions(token,callback){
    jwt.verify(token,authConfig.jwtSecret,function(err,decoded){
        if(!err){
            callback(true,decoded.data)
        } else {
            callback(false,err);
        }
    })
}

function get_user_data(token,callback){
    jwt.verify(token,authConfig.jwtSecret,function(err,decoded){
        if(!err){
            callback(false,{
                email: decoded.data.email,
                name: decoded.data.name,
                last_name: decoded.data.last_name
            })
        } else {
            callback(true,err)
        }
    })
}



module.exports = {
    generate_token,
    verify_permissions,
    get_user_data
}