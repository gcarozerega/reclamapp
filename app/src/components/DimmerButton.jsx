import React from 'react';

export default class DimmerButton extends React.Component {
    render() {
        return (
            <div className="ui dimmer modals page transition visible active" style={{display: 'block !important'}}>
            <div className="ui small basic test modal transition visible active" style={{marginTop: '-122.5px', display: 'block !important'}}>
                <div className="ui icon inverted header">
                    <i className={this.props.icon + " icon"} />
                    {this.props.msg_first}
                    <div className="sub header">
                    {this.props.msg_second}
                    </div>
                </div>
                <div className="actions">
                    {this.props.hasOwnProperty('hide_deny')?'':
                        (<div onClick={this.props.deny_click_handler} className="ui red basic cancel inverted button">
                    <i className="remove icon" />
                    {this.props.deny_msg}
                    </div>)}
                    { this.props.hasOwnProperty('hide_allow')?'':
                        (<div onClick={this.props.allow_click_handler} className="ui green ok inverted button">
                    <i className="checkmark icon" />
                    {this.props.allow_msg}
                    </div>)}
                </div>
                </div>
            </div>
        );
    }
}



