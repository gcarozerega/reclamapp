import React from 'react';
var slugify = require('slugify');

export default class LabelLister extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        elements : this.props.elements,
        elements_h:this.props.elements_h?this.props.elements_h:this.props.elements
      };
    }

    delta() {
      this.setState({
          value: event.target.value
      });
    }
    
    add_element(element){
      let elements = this.props.elements;
    
      let value = this.refs["input"].value;
    
      if(value && value!=''){
        if(elements.findIndex(e => e==value)==-1){
          elements.push(value);
          this.setState({
            elements:elements
          },() => {
            this.refs["input"].value = "";
            if(this.props.handleChange){
              this.props.handleChange(elements)
            }
          })
        } else {
          this.refs["input"].value = "";
        }
        
      }
    }

    remove_element(element){
      let elements = this.props.elements;
      
      let e_idx = elements.findIndex(e => e==element);
      if(e_idx!=-1){
        elements.splice(e_idx,1);

        this.setState({
          elements:elements
        },()=>{
          if(this.props.handleChange){
            this.props.handleChange(elements)
          }
        })
      }
    }

    render() {

      var form_color = "ui " + this.props.form_color + " label"
      var header_color = "ui " + this.props.header_color +" dividing header"
      var self = this;


      if (this.props.elements.length){
        let tags  = this.props.elements;
        if(this.props.elements_h){
          tags = this.props.elements_h;
        }
        var elements = tags.map(function(element,i) {
              return (
              <div className={form_color} key={i}> 
                {element}
                <i className="delete icon" onClick={ self.remove_element.bind(self,element) } ></i>
              </div>)
        });
      }
      else {

        var elements = (
            <div>
              <span>Aún no se definen torres.</span>
            </div>
          );
      }
      
      return (
      <div>
        <h5>{this.props.title}</h5>
        <div className="ui segments">
          <div className="ui segment">
              {elements}
          </div>
          <form onSubmit={this.add_element.bind(this)}>
              <div className="ui fluid icon input">
                <i className="building icon"></i>
                <input type="text" ref="input" name={this.props.name} placeholder={this.props.placeholder}></input>
              </div>
          </form>
        </div>
      </div>

      );
    }
}