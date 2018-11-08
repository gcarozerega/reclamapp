import React from 'react';

export default class ManagerButton extends React.Component {
    constructor(){
        super();
    }
    render() {
        //var link = "events/"+this.props.action+"/"+this.props.id
        var color = "ui basic " + this.props.color + " button"
        return (
            <button onClick={this.props.handle_click} className={color}>{this.props.text}</button>
        );
    }
}
