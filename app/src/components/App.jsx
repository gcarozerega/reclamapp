import React from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router'
import io from 'socket.io-client';
import DimmerButton from './DimmerButton.jsx';
import Dimmer from './Dimmer.jsx';

require("./App.scss");

import '../../semantic/dist/semantic.css';

var pjson = require('../../../package.json');

import RadioOption from './Utilities.jsx';
import Navbar from './Navbar.jsx'

var $ = jQuery = require('../../../node_modules/jquery/dist/jquery.js');
window.jQuery = $; // Assure it's available globally.
var jQuery = $;
var s = require('../../semantic/dist/semantic.js');

// var socket = io('http://0.0.0.0:3030');
// var socket = io.connect(document.location.protocol+'//'+document.location.host);
var socket = io();
window.socket = socket;

import {isAuthenticated} from './Utilities.jsx';

export default class App extends React.Component{
    constructor() {
        super();
        socket.on('connect', data => {
            console.log("conectado a servidor!");
        });
        this.state = {
            db_con_dimmer: {
                show: false
            },
            dimmer : {
                msg_first: "Conectando",
                msg_second: "Connectando Servidor a Base de Datos.",
                icon: "asterisk loading"
            }
        }
    }

    componentWillMount(){
        let state = this.state;
        var dimmer = {
            msg_first: "Conectando",
            msg_second: "Connectando Servidor a Base de Datos.",
            icon: "asterisk loading"
        };
        state.dimmer = dimmer;
        this.setState(state);
    }

    componentDidMount(){
        if(!isAuthenticated()){
            this.routeToAuth();
        }

        console.log('component did mount');
        let state = this.state;
        socket.emit('db_connect');

        console.log('app state',this.state);
        // $('.page.dimmer:first').dimmer('show');
        socket.on('db_connection_resolve', data => {
            $('.page.dimmer:first').dimmer('hide');
            console.log(data);
            if(!data.connection){
                state.db_con_dimmer = {
                    show: true,
                    icon: 'remove',
                    msg_first: 'Error de Conexión',
                    msg_second: "El servidor no tiene conexión con la base de datos.",
                    allow_msg: "Reintentar",
                    allow_click_handler: function(){
                        state.db_con_dimmer = {show: false};
                        this.setState(state);
                        socket.emit("db_connect");
                        $('.page.dimmer:first').dimmer('show');
                    }.bind(this),
                };
                this.setState(state);
            }
        })

        socket.on('session_expired',()=>{
            this.logout()
        })
    }

    componentWillUnmount(){
        socket.off('db_connection_resolve');
    }

    routeToAuth(){
        var href = "/auth/login";  
        var useRouterHistory = require('react-router').useRouterHistory;
        var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
        appHistory.push(href);
    }

    logout(){
        this.setState({
            loggedIn:false,
        },function(){
            this.routeToAuth();
            localStorage.removeItem("access_token");
        })
    }
    
    createUser(){
        var href = "/user/create";  
        var useRouterHistory = require('react-router').useRouterHistory;
        var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
        appHistory.push(href);
    }
  

    render() {
        return (
        <div>
            <Navbar logoutAction={this.logout.bind(this)} createUser={this.createUser.bind(this)}/>
            <div className="wrapper">
            <div className="ui main container custom-container">
                { this.props.children }
                </div>
            </div>
            { this.state.db_con_dimmer.show ? <DimmerButton hide_deny {...this.state.db_con_dimmer} /> : null }
            <Dimmer
                msg_first={this.state.dimmer.msg_first}
                msg_second={this.state.dimmer.msg_second}
                icon={this.state.dimmer.icon}
            />
        </div>
        );
    }
}
