import React from 'react';
import LabelLister from './LabelLister.jsx';
import Dimmer from './Dimmer.jsx';

import {
  Dropdown,
  Button,
  Segment
} from 'semantic-ui-react';

var $ = jQuery;

export default class CreateComplaint extends React.Component {
  constructor(props) {
      super(props);
      this.state = 
      { 
        new_complaint : {
          name : "",
          phone : "",
          address : "",
          email : "",
          admin : "",
          description : ""
        }, 
        dimmer : {
          msg_first: "",
          msg_second: "",
          icon: ""
        },
      };
  }

  handleChange(event) {
      let state = this.state;
      state.new_complaint[event.target.name] = event.target.value;
      this.setState(state);
  }

  componentWillMount(){
    
  }

  componentDidMount(){
    // Evento enviado ha sido recibido
    socket.on("new_complaint_received", data => {
      console.log("Reclamo fue recibido por el servidor")
      var dimmer = {
          msg_first: "Creado",
          msg_second: "Reclamo realizado con éxito",
          icon: "checkmark"
      };
      let state = this.state;
      state.dimmer = dimmer;
      this.setState(state);
      setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
          var href = "/reclamo";
          //var hashHistory = require('react-router').hashHistory; 
          //hashHistory.push(href);    
          var useRouterHistory = require('react-router').useRouterHistory;
          var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
          appHistory.push(href);
      }, 5000);
    });

    // Evento enviado ha sido recibido con error
    socket.on("new_complaint_error", data => {
      console.log("Reclamo fue recibido por el servidor pero con error")
      var error = data.reason;
      console.log(error);

      var dimmer = {
          msg_first: "Error al crear el reclamo",
          msg_second: error,
          icon: "remove"
      };
      let state = this.state;
      state.dimmer = dimmer;
      this.setState(state);

      setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
      }, 2000);
    });
  }

  componentWillUnmount(){
    socket.off('new_complaint_received');
    socket.off('new_complaint_error');
  }

  submit_new_complaint(){
    console.log("Enviar!");
    var state = this.state;
    var new_complaint = {
      name: this.refs["name"].value,
      phone: this.refs["phone"].value,
      address: this.refs["address"].value,
      email: this.refs["email"].value,
      admin: this.refs["admin"].value,
      description: this.refs["description"].value,
    }

    state.new_complaint = new_complaint;

    var dimmer = {
      msg_first: "Creando reclamo",
      msg_second: "",
      icon: "asterisk loading"
    };
    state.dimmer = dimmer;

    this.setState(state);
    console.log('creating new complaint', new_complaint);
    socket.emit("new_complaint", {new_complaint:new_complaint});
    $('.page.dimmer:first').dimmer('show');
  }

  render() {

    return (
     <div className="ui raised very padded text container segment">
      <h1 className="ui green dividing header">
        <div className="content">
          Formulario de Reclamos
        </div>
        <div className="sub header">
          Ingrese un nuevo reclamo en el sistema
        </div>
      </h1>
      <div className="ui hidden divider"></div>
      <div className="ui form">
          <div>
            <div className="field">
              <label>Nombre</label>
              <input 
                name="name" 
                onChange={this.handleChange.bind(this)} 
                ref="name" 
                type="text" 
                placeholder="Ingrese nombre completo" 
                value={this.state.new_complaint.name} 
                />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input 
                name="phone" 
                onChange={this.handleChange.bind(this)} 
                ref="phone" 
                type="text" 
                placeholder="Ingrese teléfono" 
                value={this.state.new_complaint.phone} 
                />
            </div>
            <div className="field">
              <label>Direccion</label>
              <input 
                name="address" 
                onChange={this.handleChange.bind(this)} 
                ref="address" 
                type="text" 
                placeholder="Ingrese dirección" 
                value={this.state.new_complaint.address} 
                />
            </div>
            <div className="field">
              <label>Email</label>
              <input 
                name="email" 
                onChange={this.handleChange.bind(this)} 
                ref="email" 
                type="email" 
                placeholder="Ingrese email" 
                value={this.state.new_complaint.email} 
                />
            </div>
            <div className="field">
              <label>Administrador</label>
              <input 
                name="admin" 
                onChange={this.handleChange.bind(this)} 
                ref="admin" 
                type="text" 
                placeholder="Ingrese administrador" 
                value={this.state.new_complaint.admin} 
                />
            </div>
            <div className="field">
              <label>Descripción del problema</label>
              <textarea 
                name="description" 
                onChange={this.handleChange.bind(this)} 
                ref="description" 
                type="text" 
                placeholder="Describa el problema" 
                value={this.state.new_complaint.description} 
                />
            </div>
        </div>

        <div className="ui hidden divider"></div>
          <div className="ui green button" onClick={this.submit_new_complaint.bind(this)}>
            <i className="envelope icon"></i>
            Enviar
          </div>
      </div>

      <Dimmer 
        msg_first={this.state.dimmer.msg_first} 
        msg_second={this.state.dimmer.msg_second} 
        icon={this.state.dimmer.icon}
      />

     </div>
    );
  }
}