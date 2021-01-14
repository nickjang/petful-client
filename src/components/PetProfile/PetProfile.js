import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PetProfile.css'

class PetProfile extends Component {
  render() {
    if (this.props.age === -1) 
      return <p>None available for adoption</p>;
    return (
      <div className='pet-profile'>
        <img src={this.props.imageURL} alt={`The ${this.props.breed} for adoption.`} />
        <section className='w-80 m-auto'>
          <h4 className='txt-center'>{this.props.name}</h4>
          <p className='txt-left'>Age: {this.props.age}</p>
          <p className='txt-left'>Breed: {this.props.breed}</p>
          <p className='txt-left'>Description: {this.props.description}</p>
          <p className='txt-left'>Gender: {this.props.gender}</p>
          <p className='txt-left'>Story: {this.props.story}</p>
        </section>
      </div>
    );
  }
}

PetProfile.defaultProps = {
  age: -1,
  breed: '',
  description: '',
  gender: '',
  imageURL: '',
  name: '',
  story: ''
}

PetProfile.propTypes = {
  age: PropTypes.number.isRequired,
  breed: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  imageURL: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  story: PropTypes.string.isRequired,
}

export default PetProfile;
