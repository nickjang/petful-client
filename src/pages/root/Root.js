import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './Root.css';
import animalsInLine from '../../assets/images/animals-in-line.jpg';

class Root extends Component {
  handleNext = (e) => {
    e.preventDefault();
    this.props.history.push('/adoption');
  }

  render() {
    return (
      <div className='flex-column al-center w-80 m-auto m-b-1'>
        <p classfName='description'>
          You can adopt a cat or a dog. When you go to the adoption page, you will only be
          shown a cat and dog that have been in the shelter the longest. You will also see a list of people in line.
          Enter your name to be added to the end of the line. When it is your turn, you can adopt a pet by clicking the
          button "Adopt" under the pet you want to adopt.
        </p>
        <img src={animalsInLine} alt='Cats and dogs in a line.' />
        <button 
          className='m-t-1'
          type='submit' 
          onClick={this.handleNext}
        >Start Adoption Process
        </button>
      </div>
    );
  }
}

export default withRouter(Root);
