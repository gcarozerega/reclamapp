var koa = require('koa'),
    path        = require('path'),
    views       = require('koa-views'),
    config      = require('config'),
    serve       = require('koa-static'),
    bodyParser  = require('koa-bodyparser');
var co = require('co');
var cors = require('koa-cors');
// var http = require('http');

var crypto = require('crypto');
var authConfig = require('./auth/config');
const jwt = require('jsonwebtoken');
var authActions = require('./auth/auth_actions');

var mailgun = require("mailgun-js");
var api_key = 'de8184aef958feebad90b89bb95baf00-4412457b-a647343b';
var DOMAIN = 'sandbox5302d602d53847748ae9f280cf47500d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

const nodemailer = require('nodemailer');

var db_location = '127.0.0.1';

var db_port = '5984';
var db_name = 'sercolex';
var community_db_name = 'sercolex_community';
var user_db_name = 'reclamapp_users'

var app = module.exports = koa();
module.exports.db_name = db_name;

// initialize render helper
app.use(views(config.template.path, config.template.options));
app.use(bodyParser());
app.use(serve('.'));
app.use(serve('static'));
app.use(cors());
require('../app/routes')(app);

// global.nano     = require('nano')('http://' + db_location + ':' +db_port);
global.nano     = require('nano')(
    {
        "url" : 'http://' + db_location + ':' + db_port
    });

global.coNano   = require('co-nano')(global.nano);
global.db       = global.coNano.use(db_name);
global.community_db = global.coNano.use(community_db_name);
global.user_db  = global.coNano.use(user_db_name);

// This must come after last app.use()
var server = require('http').Server(app.callback()),
    io = require('socket.io')(server);

// Sirviendo el bundle.js de webpack
var path_route = path.resolve(__dirname, path.normalize('../../app/build/'));
app.use(serve(path_route));


var db_check = function*(){
  console.log('checking database connection');
  try{
   var db_data = yield global.coNano.db.get(db_name)
  } catch(err){
     console.log(err);
     if(err.error=='not_found' && (err.reason=='Database does not exist.' || err.reason=='no_db_file')) {
         console.log(err.reason);
         yield function*() {
             yield global.coNano.db.create(db_name);
             console.log('database ' + db_name + ' created');
             global.db = global.coNano.use(db_name);
             if (global.db) {
                 console.log('database ' + db_name + ' used');
             }
         };

         var os = require("os");
         var hostname = os.hostname();
         var new_info = {
             _id : "info",
             hostname : hostname,
             type: 'info_hostname'
         };

         var insert = yield db.insert(new_info);
         console.log('info doc inserted');

         var db_data = yield global.coNano.db.get(db_name);
     }
  }

  try {
    var user_db_data = yield global.coNano.db.get(user_db_name);
  } catch (err){
    if(err.error=='not_found' && (err.reason=='Database does not exist.' || err.reason=='no_db_file')) {
      yield function*() {
        yield global.coNano.db.create(user_db_name);
        console.log('database ' + user_db_name + ' created');
        global.user_db = global.coNano.use(user_db_name);
        if (global.user_db) {
            console.log('database ' + user_db_name + ' used');
        }

        let views_doc = {
          by_email: {
            map: function(doc){emit(doc.username,doc)}
          },
          all_admins: {
            map: function (doc){if (doc.role == 1){emit(doc._id,{rev:doc._rev})}}
          }
        }

        yield global.user_db.insert({views:views_doc,language:"javascript"},'_design/users')
      };
    }
  }

  if(db_data){
   console.log(db_data);
   return true;
  }
  return false;

};

//host info management
co.wrap( function*(){

  if(yield db_check){
    console.log('connected to database');

    var os = require("os");
    var hostname = os.hostname();
    var new_info = {
        _id : "info",
        hostname : hostname,
        type: 'info_hostname'
    };

    try{
        var res = yield db.list({startkey: 'info', include_docs: true});
    } catch(err){
        console.log(err);
    }

    if(res && res[0].rows.length>0 && res[0].rows[0]){
        console.log('info doc exists');
        if(res[0].rows[0].doc && !(res[0].rows[0].doc.hostname==hostname)){
            console.log('updating host info');
            var rev = res[0].rows[0].doc._rev;
            var ins = yield db.insert({_id:'info',_rev:rev,hostname:hostname});
        }
    }

  } else {
    console.log('no database connection');
  }

});

//Authentication utilities
function saltshaker(){
  var length = 20;
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex')
          .slice(0,length);
}

function sha512(password, salt){
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  var value = hash.digest('hex');
  return {
      salt:salt,
      passwordHash:value
  };
};

function saltHashPassword(userpassword) {
  var salt = saltshaker();
  var passwordData = sha512(userpassword, salt);
  return {
      salt: passwordData.salt,
      password: passwordData.passwordHash
  }
}


// Socket.io
io.on('connection', co.wrap( function*(socket){

  console.log("client connection");

  socket.on('login_connect', co.wrap(function*(){
    if(yield db_check){
      socket.emit('login_connect_resolve',{connection:true, error: 'none'});
    } else {
        console.log('no database connection');
        socket.emit('login_connect_resolve',{connection:false, error: 'no_db_connection'});
    }
  }));

  socket.on('db_connect', co.wrap(function*(){
    if(yield db_check){
        console.log('connected to database');
        socket.emit('db_connection_resolve',{connection:true, error: 'none'});
    } else {
        console.log('no database connection');
        socket.emit('db_connection_resolve',{connection:false, error: 'no_db_connection'});
    }
  }));

  //Autenticacion
  function authLock(token,callback){
    authActions.verify_permissions(token,function(access,response){
        if(!access){
            socket.emit('session_expired');
        } else {
            callback(access,response)
        }
    })
  }

  socket.on('manage_complaint',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){
      var res = yield db.get(data.complaint_id);
      var complaint_obj = res[0];
      socket.emit('manage_complaint_response', complaint_obj);
    }))
    // console.log(data);
    
  }));

  socket.on('manage_community',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){
      var res = yield community_db.get(data.community_id);
      var community_obj = res[0];
      socket.emit('manage_community_response', community_obj);
    }))
    // console.log(data);
    
  }));

  socket.on('all_complaints',co.wrap(function*(data) { 
    let res_man = yield db.view('complaint','all_complaints');
    console.log(res_man);
    //var event_id = event_value[0].rows[0].id;
    //var res = yield db.get(event_id);
    //var event_obj = res[0];
    socket.emit('all_complaints_response', res_man);
  }))

  socket.on('all_admins',co.wrap(function*(data) {
    let admins = [];
    let user_db = global.coNano.use(user_db_name);
    let res = yield user_db.view('users','all_admins',{include_docs:true});
    var admins_info = res[0].rows;

    if(admins_info){
      for(let admin of admins_info){
        admins.push(admin.doc);
      }
    }

    socket.emit("all_admins_response", {admins: admins});  
  }))

  socket.on('complaints_not_solved',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){ 
      let not_solved = [];
      let complaint_db = global.coNano.use(db_name);
      let res = yield complaint_db.view('complaint','not_solved',{include_docs:true});
      var complaints_info = res[0].rows;

      if(complaints_info){
        for(let complaint of complaints_info){
          not_solved.push(complaint.doc);
         console.log("complaint", complaint.doc);
        }
      }

      socket.emit("complaints_not_solved_response", {not_solved: not_solved});
    }))
  }))

  socket.on('complaints_solved',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){ 
      let solved = [];
      let complaint_db = global.coNano.use(db_name);
      let res = yield complaint_db.view('complaint','solved',{include_docs:true});
      var complaints_info = res[0].rows;

      if(complaints_info){
        for(let complaint of complaints_info){
          solved.push(complaint.doc);
         console.log("complaint", complaint.doc);
        }
      }

      socket.emit("complaints_solved_response", {solved: solved});
    }))
  }))

  socket.on('community_list',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){ 
      let communities = [];
      let community_db = global.coNano.use(community_db_name);
      let res = yield community_db.view('community','all_communities',{include_docs:true});
      var communities_info = res[0].rows;

      if(communities_info){
        for(let community of communities_info){
          communities.push(community.doc);
        }
      }

      socket.emit("community_list_response", {communities: communities});
    }))
  }))

  // Borrando un evento de la lista
  socket.on('delete_community', co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){
      var community = yield global.community_db.get(data.community_id);
      try{
        console.log("attempting to delete: "+ data.community_id);
        let request = require("co-request");
        "use strict";

        //Delete doc
        let doc_result = yield global.community_db.destroy(community[0]._id,community[0]._rev);
        console.log("deleted document: ", doc_result[0].id);

        socket.emit('delete_community_resolve', {status:'success', success:true, community_id: data.community_id});
        // socket.emit('event_deleted', {})

      }
      catch (e){
        console.log("Error: "+e);
        console.log("Filed to delete: "+ community_id);
        socket.emit('event_delete_resolve', {status:'failure', success:false});
        // socket.emit('event_delete_error', {reason: e});
      }
    }))

  }));

  socket.on('asking', function (data) {
    // console.log(data);
  });

  // Enviando información del reclamo
  socket.on('manage_complaint',co.wrap(function*(data) {
    authLock(data.token,co.wrap(function*(){
      var res = yield db.get(data.complaint_id);
		  var complaint_obj = res[0];
      socket.emit('manage_complaint_response', complaint_obj);
    }))
    // console.log(data);
    
  }));

  // Actualización de reclamo
  socket.on('update_complaint',co.wrap(function*(_data) {
    authLock(_data.token,co.wrap(function*(){
      let data = _data.complaint;
      console.log("complaint to update: "+ data.complaint_id);
      var db_complaint = yield db.get(data.complaint_id);
      data['_rev'] = db_complaint[0]._rev;
      console.log(data);

      if(data.solution){
        data.status = 2;
      }
      yield global.db.insert(data, db_complaint[0]._id, 
      function (error, response) {
        if(!error) {
          // console.log("Updated! it worked");
          socket.emit('update_sucess', data);

        } else {
          // console.log("sad panda :´c");
          var error_update = { reason : error };
          socket.emit('update_failed', error_update);
        }
      });
    }))
  }));

  socket.on('update_community',co.wrap(function*(_data) {
    authLock(_data.token,co.wrap(function*(){
      let data = _data.community;
      console.log("community to update: "+ data.community_id);
      var db_community = yield community_db.get(data.community_id);
      data['_rev'] = db_community[0]._rev;
      console.log(data);

      yield global.community_db.insert(data, db_community[0]._id, 
      function (error, response) {
        if(!error) {
          // console.log("Updated! it worked");
          socket.emit('update_sucess', data);

        } else {
          // console.log("sad panda :´c");
          var error_update = { reason : error };
          socket.emit('update_failed', error_update);
        }
      });
    }))
  }));


  socket.on('authenticate',co.wrap(function*(data){
    if(data.username.length<1 || data.password.length<1){
      socket.emit('authentication',{
        error:{
          reason:'empty_credentials'
        }
      })
    } else {
      try{
        let user_response = yield global.user_db.view('users','by_email',{key:data.username});
        let user = user_response[0].rows[0];
        console.log(user);
        if(!user){
          socket.emit('authentication',{
            error:{
              reason:'user_notfound'
            }
          })
        } else{
          if ( !(user.value.password==sha512(data.password,user.value.salt).passwordHash) ){
            socket.emit('authentication',{
              error:{
                reason:'pwd_incorrect'
              }
            })
          } else {

            let data = {
              email:user.value.email,
              name:user.value.name,
              last_name:user.value.last_name
            }

            authActions.generate_token(data,function(token){
              socket.emit('authentication',{
                error:false,
                token:token
              })
            })

            
          }
        } 
      } catch (err){
        if(err.reason=='missing'){
          socket.emit('authentication',{
            error:{
              reason:'user_notfound'
            }
          })
        } else if(err.reason!='missing' && err.error=='not_found'){
          socket.emit('authentication',{
            error:{
              reason:'db_error'
            }
          })
        }
        
      }
    }
  }))

  socket.on('create_user',co.wrap(function*(data){
    authLock(data.token,co.wrap(function*(){
      if(data.user){
        let error = false;
        if(data.user.email==''){
          error = true;
        } else if (data.user.pwd==''){
          error = true;
        } else if (data.user.confirm==''){
          error = true;
        } else if (data.user.pwd!=data.user.confirm){
          error = true;
        }
  
        if(error){
          socket.emit('create_user_error',{error:{
            reason:'wrong_credentials'
          }})
        } else {
          try {
            let user_check = yield global.user_db.view('users','by_email',{key:data.user.email});
            if(user_check[0].rows.length>0){
              socket.emit('create_user_error',{error:{
                reason:'user_exists'
              }})  
            } else {
              let saltPwd = saltHashPassword(data.user.pwd);
  
              var d = new Date()
  
              let new_user = {
                name:data.user.name,
                last_name:data.user.last_name,
                salt:saltPwd.salt,
                password:saltPwd.password,
                username:data.user.email,
                role:data.user.role,
                created_at:d.toISOString()
              }
  
              try {
                let insert_res = yield global.user_db.insert(new_user);
                if(insert_res[0].ok){
                  socket.emit('create_user_success');
                } else {
                  socket.emit('create_user_error',{error:{
                    reason:'db_error'
                  }})      
                }
                
              } catch (err){
                socket.emit('create_user_error',{error:{
                  reason:'db_error'
                }})    
              }
            }
          } catch (err) {
            socket.emit('create_user_error',{error:{
              reason:'db_error'
            }})
          }
        }
      } else {
        socket.emit('create_user_error',{error:{
            reason:'no_user_obj'
        }})
      }
    }))
    
  }))

  socket.on('create_complaint',co.wrap(function*(data){
    if(data.complaint){
      let error = false;
      if(data.complaint.email==''){
        error = true;
      }
      if(error){
        socket.emit('create_complaint_error',{error:{
          reason:'wrong_credentials'
        }})
      } else {
        try {
          var d = new Date()
  
          let new_complaint = {
            _id: "complaint_"+(new Date().getTime()),
            name : data.complaint.name,
            phone : data.complaint.phone,
            email : data.complaint.email,
            admin : data.complaint.admin,
            address : data.complaint.address,
            description : data.complaint.description,
            status : 0,
            date:d.toISOString()
          }
  
          try {
            let insert_res = yield global.db.insert(new_complaint);
            if(insert_res[0].ok){
              socket.emit('create_complaint_success');
            } else {
              socket.emit('create_complaint_error',{error:{
                reason:'db_error'
              }})      
            }
                
              } catch (err){
                socket.emit('create_complaint_error',{error:{
                  reason:'db_error'
                }})    
              }
          } catch (err) {
            socket.emit('create_complaint_error',{error:{
              reason:'db_error'
            }})
          }
        }
    } else {
      socket.emit('create_complaint_error',{error:{
        reason:'no_complaint_obj'
      }})
    }
  }))

  socket.on('create_community',co.wrap(function*(data){
    authLock(data.token,co.wrap(function*(){
      if(data.community){
        let error = false;
        if(data.community.name==''){
          error = true;
        }
        if(error){
          socket.emit('create_community_error',{error:{
            reason:'wrong_credentials'
          }})
        } else {
          try {
            let community_check = yield global.community_db.view('community','by_name',{key:data.community.name});
            if(community_check[0].rows.length>0){
              socket.emit('create_community_error',{error:{
                reason:'community_exists'
              }})  
            } else {

              let new_community = {
                _id: "community_"+(new Date().getTime()),
                name : data.community.name,
                admin : data.community.admin,
                address : data.community.address,
                towers : data.community.towers,
              }
      
              try {
                let insert_res = yield global.community_db.insert(new_community);
                if(insert_res[0].ok){
                  socket.emit('create_community_success');
                } else {
                  socket.emit('create_community_error',{error:{
                    reason:'db_error'
                  }})      
                }
                    
                  } catch (err){
                    socket.emit('create_community_error',{error:{
                      reason:'db_error'
                    }})    
                  }
              }
            } catch (err) {
              socket.emit('create_community_error',{error:{
                reason:'db_error'
              }})
            }
          }
      } else {
        socket.emit('create_community_error',{error:{
          reason:'no_community_obj'
        }})
      }
    }))
  }))
}));

// Start the server
server.listen(3030, "0.0.0.0");
// console.info('Now running on localhost:3030');