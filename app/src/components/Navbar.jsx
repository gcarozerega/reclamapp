import React from 'react';
import { Link } from 'react-router';

var logo = require('../../images/sercolex.png');

import {Icon} from 'semantic-ui-react';

export default class Navbar extends React.Component {
    constructor(props){
      super(props)
    }

    logout(){
      if(this.props.logoutAction){
        this.props.logoutAction();
      }
    }

    createUser(){
      if(this.props.createUser){
        this.props.createUser();
      }
    }


    render() {
         return (
           <div className="ui fixed menu">
             <div className="ui container custom-container">
               <div className="brand item">
               
                <Link to="/">
                  <span> Reclamapp</span>
                 </Link>
               </div>

               <Link to="/manage" className="item" >Reclamos</Link>

               <div href="#" className="ui simple dropdown item">
                 Comunidades<i className="dropdown icon"></i>
                 <div className="menu">
                    <Link to="/community" className="item">Listado</Link>
                    <Link to="/community/create" className="item">Crear comunidad</Link>
                 </div>
               </div>

               <div className="right menu">
               <a className="ui item" onClick={this.createUser.bind(this)}>
                  <Icon name='user'/> Crear Usuario
                </a>
                <a className="ui item" onClick={this.logout.bind(this)}>
                  <Icon name='log out'/> Cerrar Sesión
                </a>
               </div>
               
             </div>
           </div>
         );
    }
}
