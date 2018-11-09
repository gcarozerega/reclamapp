import React from 'react';
import LabelLister from './LabelLister.jsx';
import Dimmer from './Dimmer.jsx';

var slugify = require('slugify');

import {
  Dropdown,
  Button,
  Segment,
  Form
} from 'semantic-ui-react';

var $ = jQuery;

export default class ManageComplaint extends React.Component {
    constructor(){
      super();
      this.state = 
      { 
        community:{
            name:'',
            address:'',
            admin:'',
            towers:[]
        }, 
        all_admins:[],
        dimmer : {
          msg_first: "",
          msg_second: "",
          icon: ""
        }
      };
    }

    componentWillMount(){
      socket.emit("manage_community", {token:localStorage.getItem('access_token'),community_id: this.props.params.id});
      socket.emit("all_admins");
      
      socket.on("all_admins_response", data => {
        let state = this.state;
        state.all_admins = data.admins;
        state.community.admin = data.admins[0].name + " " + data.admins[0].last_name;
        this.setState(state);
      });
    }

    componentDidMount(){
      socket.on("manage_community_response", data => {
        var community = {
          community_id: this.props.params.id,
          name:data.name,
          address:data.address,
          admin:data.admin,
          towers:data.towers
        }

        this.setState({
          community:community
        })
      });

      // Evento actualizado ha sido recibido
      socket.on("update_sucess", data => {
        console.log("evento fue actualizado por el servidor")
        var dimmer = {
          msg_first: "Actualizado",
          msg_second: "Comunidad actualizada con éxito",
          icon: "checkmark"
        }
        let state = this.state;
        state.dimmer = dimmer;
        this.setState(state);
        setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
          var href = "/community";
          var useRouterHistory = require('react-router').useRouterHistory;
          var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
          appHistory.push(href);
        }, 2000);            
      });
      
      // Error al actualizar evento
      socket.on("update_failed", data => {
        console.log("Hubo un error al actualizar")
        var error = data.reason;
        console.log(error);

        var dimmer = {
          msg_first: "Error al actualizar la comunidad",
          msg_second: "Respuesta: " + {error},
          icon: "remove"
        }
        let state = this.state;
        state.dimmer = dimmer;
        this.setState(state);

        setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
        }, 2000);            
      });

    }

    componentWillUnmount(){
      socket.off("update_sucess");
      socket.off("update_failed");
      socket.off("manage_community");
      socket.off("manage_community_response");
      socket.off('all_admins');
      socket.off('all_admins_response');
    }

    onChange(key,e){
      let community = this.state.community;
      community[key] = e.target.value;
      this.setState({
          community:community
      })
    }

    handleTowerChange(tower){
      this.setState({towers:tower});
    }

    update_community(){
      console.log("Enviar!");
      
      let community = this.state.community;

      var dimmer = {
        msg_first: "Actualizando comunidad",
        msg_second: "",
        icon: "asterisk loading"
      }
      this.setState({
        dimmer:dimmer
      });
      
      socket.emit("update_community", {token:localStorage.getItem('access_token'),community:community});
      console.log(community)
      $('.page.dimmer:first').dimmer('show');

    }

    render() {

          return (
            <div>
              <h1 className="ui blue dividing header">
                <div className="content">
                  Administrar Comunidad
                </div>
              </h1>
            <div className="ui hidden divider"></div>

            <Form
              onSubmit={this.update_community.bind(this)}
            >
                <Form.Input fluid required label='Nombre' placeholder='Ingrese nombre' value={this.state.community.name} onChange={this.onChange.bind(this,'name')}/>
                <Form.Input fluid required label='Dirección' placeholder='Ingrese dirección' value={this.state.community.address} onChange={this.onChange.bind(this,'address')}/>
                <Form.Field required label='Administrador' control='select' onChange={this.onChange.bind(this,'admin')}>
                    {this.state.all_admins.map((e,i)=>{
                        return (
                          <option key={i} value={e.name + " " + e.last_name}>{e.name + " " + e.last_name}</option>
                          )
                    })}
                </Form.Field>
                <LabelLister    ref="towers" 
                                type="towers" 
                                header_color="green" 
                                form_color="blue" 
                                title="Torres" 
                                name="input_towers" 
                                placeholder="Nombre de la torre. Enter para agregar." 
                                elements={this.state.community.towers}
                                handleChange={this.handleTowerChange.bind(this)}
                />
                <br/>
                <Form.Button positive>Editar Comunidad</Form.Button>
            </Form>

            <Dimmer 
              msg_first={this.state.dimmer.msg_first} 
              msg_second={this.state.dimmer.msg_second} 
              icon={this.state.dimmer.icon}
            />                
            <div className="ui page dimmer">
 
            </div>
          </div>
         );
    }
}





