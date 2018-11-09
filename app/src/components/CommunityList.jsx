import React from 'react';
import CommunityInfoCard from './CommunityInfoCard.jsx';
import Dimmer from './Dimmer.jsx';

var $ = jQuery;

import {
  Grid
} from 'semantic-ui-react';

export default class CommunityList extends React.Component{
  constructor(){
    super();
    this.state = 
      { 
        list_communities : [],
        delete_dimmer : {
            msg_first: "",
            msg_second: "",
            icon: ""
        }
      }
  }
  componentDidMount(){
    socket.emit("community_list",{token:localStorage.getItem('access_token')});
    
    socket.on("community_list_response", data => {
      let state = this.state;
      state.list_communities = data.communities;
      this.setState(state);
    });

    socket.on('community_delete_resolve', data => {
        console.log(data);
        if(data.success && data.community_id) {
            var dimmer = {
                msg_first: "Eliminada",
                msg_second: "Comunidad eliminada con éxito",
                icon: "checkmark"
            };
            let state = this.state;
            state.delete_dimmer = dimmer;
            this.setState(state);
            setTimeout(function(){
                $('.page.dimmer:first').dimmer('hide');
                this.delete_community(data.community_id);
                var href = "/community";  
                var useRouterHistory = require('react-router').useRouterHistory;
                var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
                appHistory.push(href);
            }.bind(this), 2000);
            $('.page.dimmer:first').dimmer('show');
        }
    });
  }

  componentWillUnmount(){
      socket.off('community_list');
      socket.off('community_list_response');
      socket.off('community_delete_resolve');
  }

  delete_community(community){
    var state = this.state;
    var removeIndex = state.list_communities.findIndex(e => e._id == community);
    console.log("Indice: "+removeIndex);
    if (removeIndex > -1) {
      state.list_communities.splice(removeIndex, 1);
    }
    this.setState(state);

  }
  render() {
    let community_cards = this.state.list_communities.map((e,i)=>{
    return (
      <Grid.Column key={i}>
        <CommunityInfoCard community={e} deleteAction={this.delete_community.bind(this)} key={i}/> 
      </Grid.Column>
      )
    })
    return (
    <div>
        <h1 className="ui blue dividing header">
          Comunidades
        </h1>

        <div className="ui hidden divider"></div>

        <Grid columns={2}>
          {community_cards}
        </Grid>
      <Dimmer {...this.state.delete_dimmer} />
    </div>
    )
  }
}

