import React from 'react';

export default class Dimmer extends React.Component {
    componentWillMount(){
        console.log(this.props);
    }
    render() {
        return (
            <div className="ui page dimmer">
              <div className="content">
                <h2 className="ui inverted icon header">
                  <i className={this.props.icon + " icon"} />
                  	{this.props.msg_first}
                  <div className="sub header">{this.props.msg_second}</div>
                </h2>
              </div>
            </div>
        );
    }
}



