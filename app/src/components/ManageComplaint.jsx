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
        complaint:{
          name : "",
          phone : "",
          address : "",
          email : "",
          description : "",
          community:"",
          tower:"",
          status:"",
          date:""
        }, 
        towers:[],
        list_communities:[],
        dimmer : {
          msg_first: "",
          msg_second: "",
          icon: ""
        }
      };
    }

    componentWillMount(){
      socket.emit("manage_complaint", {token:localStorage.getItem('access_token'),complaint_id: this.props.params.id});
      socket.emit("community_list",{token:localStorage.getItem('access_token')});
      
      socket.on("community_list_response", data => {
        let state = this.state;
        state.list_communities = data.communities;
        this.setState(state);
      });
    }

    componentDidMount(){
      var self = this;
      
      socket.on("manage_complaint_response", data => {
        var complaint = {
          complaint_id: this.props.params.id,
          name : data.name,
          phone : data.phone,
          address : data.address,
          email : data.email,
          description : data.description,
          date: data.date,
          status: data.status,
          community: data.community,
          tower: data.tower
        }

        this.setState({
          complaint:complaint
        })
      });

      // Evento actualizado ha sido recibido
      socket.on("update_sucess", data => {
        console.log("evento fue actualizado por el servidor")
        var dimmer = {
          msg_first: "Actualizado",
          msg_second: "Reclamo actualizado con éxito",
          icon: "checkmark"
        }
        let state = this.state;
        state.dimmer = dimmer;
        this.setState(state);
        setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
          var href = "/manage";
          var useRouterHistory = require('react-router').useRouterHistory;
          var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
          appHistory.push(href);
        }, 2000);            
      });
      
      // Error al actualizar evento
      socket.on("update_failed", data => {
        console.log("evento fue pero hubo un error al actualizar")
        var error = data.reason;
        console.log(error);

        var dimmer = {
          msg_first: "Error al crear el evento",
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
      socket.off("manage_complaint");
      socket.off("manage_complaint_response");
      socket.off("community_list_response");
      socket.off("community_list");

    }

    onChange(key,e){
      let complaint = this.state.complaint;
      complaint[key] = e.target.value;
      this.setState({
          complaint:complaint
      })
    }

    onChangeCommunity(e){
      let complaint = this.state.complaint;
      complaint.community = this.state.list_communities[e.target.value].name;
      let towers = this.state.list_communities[e.target.value].towers;
      this.setState({
        complaint:complaint,
        towers:towers
      })
    }

    onChangeTower(e){
        let complaint = this.state.complaint;
        complaint.tower = e.target.value.replace("_", " ");
        this.setState({
            complaint:complaint
        })
    }

    update_complaint(){
      console.log("Enviar!");
      
      let complaint = this.state.complaint;

      var dimmer = {
        msg_first: "Actualizando reclamo",
        msg_second: "",
        icon: "asterisk loading"
      }
      this.setState({
        dimmer:dimmer
      });
      
      socket.emit("update_complaint", {token:localStorage.getItem('access_token'),complaint:complaint});
      console.log(complaint)
      $('.page.dimmer:first').dimmer('show');

    }

    render() {

      let complaint = this.state.complaint;

         return (
           <div>
              <h1 className="ui blue dividing header">
                <div className="content">
                  Administración de reclamo
                </div>
              </h1>
              <div className="ui hidden divider"></div>

              <table className="ui compact table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Dirección</th>
                    <th>Comunidad</th>
                    <th>Torre</th>
                    <th>Residente</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{complaint.date}</td>
                    <td>{complaint.address}</td>
                    <td>  
                      <Form>
                      <Form.Field control='select' onChange={this.onChangeCommunity.bind(this)}>
                          <option value={complaint.community}>{complaint.community}</option>
                          {this.state.list_communities.map((e,i)=>{
                              return (
                                <option key={i} value={i}>{e.name}</option>
                                )
                          })}
                          
                      </Form.Field>
                      </Form>
                    </td>
                    <td>
                      <Form>
                      <Form.Field control='select' onChange={this.onChangeTower.bind(this)}>
                          <option value={complaint.tower}>{complaint.tower}</option>
                          {this.state.towers.map((e,i)=>{
                              return (
                                <option key={i} value={e}>{e.replace("_", " ")}</option>
                                )
                          })}
                      </Form.Field>
                      </Form>
                    </td>
                    <td>{complaint.name}</td>
                    <td>{complaint.description}</td>
                  </tr>
                </tbody>
              </table>

              <Form
                  onSubmit={this.update_complaint.bind(this)}
              >
                  <Form.TextArea label='Solución al reclamo' placeholder='Describa la solución al reclamo' onChange={this.onChange.bind(this,'solution')}/>
                  <Form.Button positive>Actualizar</Form.Button>
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





