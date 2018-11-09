import React from 'react';
import ManagerButton from './ManagerButton.jsx';
import DimmerButton from './DimmerButton.jsx';
import { Link } from 'react-router'

import {
  Grid,
  Card,
  Button,
  Icon,
  List,
  Dimmer,
  Segment,
  Header
} from 'semantic-ui-react';

export default class EventInfoCard extends React.Component {
  constructor(){
    super();
    this.state = { 
      dimmer_show : false
    }
  }

  get_report(){
    var href = document.location.protocol+'//'+document.location.host+"/events/" + this.props.event._id + '/get_report';
    var a = document.createElement("a");
    a.style = "display: none";
    a.href = href;
    a.click();
  }

  get_control_report(){
    var href = document.location.protocol+'//'+document.location.host+"/events/" + this.props.event._id + '/get_control_report';
    var a = document.createElement("a");
    a.style = "display: none";
    a.href = href;
    a.click();
  }

  event_manage(){
    var href = "/events/manage/" + this.props.event._id;
    //var hashHistory = require('react-router').hashHistory; 
    //hashHistory.push(href);    
    var useRouterHistory = require('react-router').useRouterHistory;
    var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
    appHistory.push(href);
  }

  event_stats(){
    var href = "/events/stats/" + this.props.event._id;
    //var hashHistory = require('react-router').hashHistory; 
    //hashHistory.push(href);    
    var useRouterHistory = require('react-router').useRouterHistory;
    var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
    appHistory.push(href);
  }

  event_layout(){
    var href = "/events/layout/" + this.props.event._id;
    //var hashHistory = require('react-router').hashHistory; 
    //hashHistory.push(href);    
    var useRouterHistory = require('react-router').useRouterHistory;
    var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
    appHistory.push(href);
  }

  delete_event_button_click(){
    console.log("click")
    this.setState({
      dimmer_show:true
    });
  }

  allow_click_handler(){
    this.setState({
      dimmer_show:false
    },()=>{
      socket.emit("delete_event",{ event_id: this.props.event._id,token:localStorage.getItem('access_token') });
    })
  }

  deny_click_handler(){
    this.setState({
      dimmer_show:false
    })
  }

  request_excel(){
    socket.emit("request_excel",{
                                  token:localStorage.getItem('access_token'),
                                  event_id: this.props.event._id, 
                                  event_name: this.props.event.name
                                });
  }

  

  render() {
    var id = this.props.event._id;
    var href = "/events/stats/" + id;
    return (
      <div>
        <Dimmer.Dimmable blurring dimmed={this.state.dimmer_show}>
          <Dimmer active={this.state.dimmer_show}>
              <Header as='h3' inverted>
              Eliminar Evento
              <Header.Subheader>¿Está seguro que desea eliminar el evento?</Header.Subheader>
              
              <Button inverted onClick={this.deny_click_handler.bind(this)}>Cancelar</Button>
              <Button color={"red"} onClick={this.allow_click_handler.bind(this)}>Aceptar</Button>
            </Header>
            
          </Dimmer>

          <Card fluid color="teal">
            <Card.Content>
              <Card.Header>
                <Link to={href}>{this.props.event.name}</Link>
              </Card.Header>
              <Card.Meta>
                <Icon name="marker"/>{this.props.event.location}
              </Card.Meta>
              <Card.Description>
                <List>
                  <List.Item>
                    <List.Icon name="user"/>
                    <List.Content>
                      {this.props.event.attendee_number} asistentes
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="child"/>
                    <List.Content>
                      {this.props.event.accredited} acreditados
                    </List.Content>
                  </List.Item>
                </List>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className={"ui fluid "+((this.props.event.control)?"four":"three")+" buttons"}>
                <ManagerButton id={"edit_"+id} handle_click={this.event_manage.bind(this)} action="manage" color="green" text="Editar Evento" />
                <ManagerButton id={"report_"+id} handle_click={this.get_report.bind(this)} action="get_report" color="blue" text="Descargar reporte" />
                {this.props.event.control?<ManagerButton id={"control_"+id} handle_click={this.get_control_report.bind(this)} action="get_control_report" color="orange" text="Reporte de Control" />:null}
                <ManagerButton id={"delete_"+ id} handle_click={this.delete_event_button_click.bind(this)} action="try_to_delete" color="red" text="Eliminar evento" />
              </div>
            </Card.Content>
          </Card>

          
        </Dimmer.Dimmable>
      </div>
      
    )
  }
};