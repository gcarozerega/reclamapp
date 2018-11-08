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

export default class CommunityInfoCard extends React.Component {
  constructor(){
    super();
    this.state = { 
      dimmer_show : false
    }
  }

  community_manage(){
    var href = "/community/manage/" + this.props.community._id;
    //var hashHistory = require('react-router').hashHistory; 
    //hashHistory.push(href);    
    var useRouterHistory = require('react-router').useRouterHistory;
    var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
    appHistory.push(href);
  }

  delete_community_button_click(){
    console.log("click")
    this.setState({
      dimmer_show:true
    });
  }

  allow_click_handler(){
    this.setState({
      dimmer_show:false
    },()=>{
      socket.emit("delete_community",{ community_id: this.props.community._id,token:localStorage.getItem('access_token') });
    })
  }

  deny_click_handler(){
    this.setState({
      dimmer_show:false
    })
  }

  render() {
    var id = this.props.community._id;
    var href = "/community/manage/" + id;
    return (
      <div>
        <Dimmer.Dimmable blurring dimmed={this.state.dimmer_show}>
          <Dimmer active={this.state.dimmer_show}>
              <Header as='h3' inverted>
              Eliminar comunidad
              <Header.Subheader>¿Está seguro que desea eliminar la comunidad?</Header.Subheader>
              
              <Button inverted onClick={this.deny_click_handler.bind(this)}>Cancelar</Button>
              <Button color={"red"} onClick={this.allow_click_handler.bind(this)}>Aceptar</Button>
            </Header>
            
          </Dimmer>

          <Card fluid color="blue">
            <Card.Content>
              <Card.Header>
                <Link to={href}>{this.props.community.name}</Link>
              </Card.Header>
              <Card.Description>
                <List>
                  <List.Item>
                    <List.Icon name="map marker alternate"/>
                    <List.Content>
                      Dirección: {this.props.community.address}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Icon name="user"/>
                    <List.Content>
                      Administrador: {this.props.community.admin}
                    </List.Content>
                  </List.Item>
                </List>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className={"ui fluid "+((this.props.community.control)?"four":"three")+" buttons"}>
                <ManagerButton id={"edit_"+id} handle_click={this.community_manage.bind(this)} action="manage" color="green" text="Editar comunidad" />
                <ManagerButton id={"delete_"+ id} handle_click={this.delete_community_button_click.bind(this)} action="try_to_delete" color="red" text="Eliminar comunidad" />
              </div>
            </Card.Content>
          </Card>

          
        </Dimmer.Dimmable>
      </div>
      
    )
  }
};