import React, { Component } from 'react';
import PetProfile from '../../components/PetProfile/PetProfile';
import apiService from '../../services/apiService';

class Adoption extends Component {
  state = {
    name: {
      value: '',
      touched: false,
      submitted: '',
      afterAdopting: ''
    },
    peopleInFront: [],
    peopleBehind: [],
    petsInFront: {
      cat: {},
      dog: {}
    },
    adoptedPet: null,
    timerRunning: false,
    error: ''
  }

  handleOtherUsers = (peopleInFront, submitted, timerRunning) => {
    if (timerRunning) return;
    if (peopleInFront.length) {
      this.setState({ timerRunning: true })
      setTimeout(this.handlePeopleLeaving, 5000);
    } else if (submitted) {
      this.setState({ timerRunning: true })
      setTimeout(this.handlePeopleComing, 5000);
    } else {
      return;
    }
  }

  handlePeopleLeaving = () => {
    if (!this.state.peopleInFront.length) return;

    this.setState(
      { error: '' },
      () => {
        let type;
        // if no cats, adopt dog, and vice versa
        if (!this.state.petsInFront.cat) type = 'dog';
        else if (!this.state.petsInFront.dog) type = 'cat';
        else type = ['cat', 'dog'][Math.floor(Math.random() * 2)];
        apiService.adopt(type)
          .then(() => {
            // change currently shown cat or dog
            apiService.getNextPet(type)
              .then((pet) => {
                // remove person in front of line
                const peopleInFront = [...this.state.peopleInFront];
                peopleInFront.shift();
                const petsInFront = { ...this.state.petsInFront };
                petsInFront[type] = pet;
                this.setState(
                  { peopleInFront, petsInFront, timerRunning: false, error: '' },
                  () => this.handleOtherUsers(peopleInFront, this.state.name.submitted, false));
              })
              .catch((e) => { this.setState({ error: e.error }) });
          })
          .catch((e) => { this.setState({ error: e.error }) });
      }
    )
  }

  handlePeopleComing = () => {
    if (!this.state.name.submitted) return;

    this.setState(
      { error: '' },
      () => {
        const person = ['John', 'Apple', 'William', 'Sarah'][Math.floor(Math.random() * 4)];
        apiService.addPerson(person)
          .then(({ person }) => {
            const peopleBehind = [...this.state.peopleBehind, person];
            this.setState({ peopleBehind, timerRunning: false, error: '' },
              () => this.handleOtherUsers([], this.state.name.submitted, false));
          })
          .catch((e) => { this.setState({ error: e.error }) });
      }
    )
  }

  handleAdopt = (e, type) => {
    e.preventDefault();
    this.setState(
      { error: '' },
      () => {
        apiService.adopt(type)
          .then((res) => {
            const person = res.person;
            const adoptedPet = res[type];

            if (person !== this.state.name.submitted)
              return this.setState({ error: 'Got back another person, not user, adopted pet.' })

            // remove user from line
            const name = {
              value: person,
              touched: false,
              submitted: '',
              afterAdopting: this.state.name.submitted
            };
            // update with adopted pet and remove from pet line
            adoptedPet.type = type;
            // move people to front of line
            const peopleInFront = [...this.state.peopleBehind];
            const peopleBehind = [];
            // change currently shown cat or dog
            apiService.getNextPet(type)
              .then((pet) => {
                const petsInFront = { ...this.state.petsInFront };
                petsInFront[type] = pet;
                this.setState(
                  { name, adoptedPet, petsInFront, peopleInFront, peopleBehind },
                  () => this.handleOtherUsers(peopleInFront, name.submitted, false)
                );
              })
              .catch((e) => { this.setState({ error: e.error }) });
          })
          .catch((e) => { this.setState({ error: e.error }) });
      }
    )
  }

  queueUser = (e) => {
    e.preventDefault();
    this.setState(
      { error: '' },
      () => {
        apiService.addPerson(this.state.name.value)
          .then(({ person }) => {
            let runFunction = false;
            this.setState(prevState => {
              if (!prevState.timerRunning)
                runFunction = true;
              return {
                name: {
                  value: '',
                  touched: false,
                  submitted: person,
                  afterAdopting: this.state.name.afterAdopting
                },
                error: ''
              }
            },
              () => {
                if (runFunction)
                  this.handleOtherUsers(this.state.peopleInFront, person, false);
              })
          })
          .catch((e) => { this.setState({ error: e.error }) });
      }
    )
  }

  updateName = (name) => {
    this.setState({
      name: {
        value: name,
        touched: true,
        submitted: this.state.name.submitted,
        afterAdopting: this.state.name.afterAdopting
      }
    });
  }

  validateName = () => {
    const name = this.state.name.value.trim();
    if (!name) return 'Name cannot be empty.';
    return;
  }

  generatePeopleLineString = () => {
    let peopleInLine;
    let user;

    // whether user is in line
    if (this.state.name.submitted) {
      if (this.state.peopleInFront.length) {
        user = ', ' + this.state.name.submitted;
      } else {
        user = this.state.name.submitted;
      }
    } else {
      user = '';
    }
    peopleInLine = this.state.peopleInFront.join(', ') + user;
    // whether people are behind user
    if (this.state.peopleBehind.length)
      peopleInLine += (', ' + this.state.peopleBehind.join(', '));
    return peopleInLine;
  }

  componentDidMount() {
    apiService.getPeopleInLine()
      .then(({ people }) => {
        Promise.all([
          apiService.getNextPet('cat'),
          apiService.getNextPet('dog')
        ])
          .then(res => {
            this.setState({
              peopleInFront: people,
              petsInFront: {
                cat: res[0],
                dog: res[1]
              }
            },
              () => this.handleOtherUsers(people, ''));
          })
          .catch((e) => { this.setState({ error: e.error }) });
      })
      .catch((e) => { this.setState({ error: e.error }) });
  }

  render() {
    let peopleInLineString = this.generatePeopleLineString();
    let renderAdoptButton = this.state.peopleInFront.length === 0 && this.state.name.submitted;
    let adoptedPetString;
    if (this.state.adoptedPet)
      adoptedPetString = `${this.state.name.afterAdopting}, you have adopted a ${this.state.adoptedPet.type}:`;


    return (
      <div className='flex-column al-center w-fit-content m-auto m-b-1'>
        <h2>Adoption</h2>
        <span className='error'>{this.state.error}</span>
        <p className='w-80 m-auto m-t-1'>People in line: {peopleInLineString}</p>
        <form className='m-auto m-t-1'>
          <label>To stand in line, enter your name: </label>
          <div className='m-t-1'>
            <input
              id={'name'}
              name={'name'}
              aria-required='true'
              aria-describedby={'name-error-message'}
              aria-invalid={!!this.validateName()}
              onChange={(e) => this.updateName(e.target.value)}
            />
            <button
              type='submit'
              onClick={(e) => { this.queueUser(e) }}
              disabled={this.validateName() || this.state.name.submitted}
            > Join Line
           </button>
          </div>
          <span className='error'>{this.state.name.touched && this.validateName()}</span>
        </form>
        {this.state.adoptedPet
          ? <div className='lg-card m-t-1 txt-center'>
            <p className='w-80'>{adoptedPetString}</p>
            <PetProfile
              age={this.state.adoptedPet.age}
              breed={this.state.adoptedPet.breed}
              description={this.state.adoptedPet.description}
              gender={this.state.adoptedPet.gender}
              imageURL={this.state.adoptedPet.imageURL}
              name={this.state.adoptedPet.name}
              story={this.state.adoptedPet.story}
            />
          </div>
          : null}
        <article className='pets'>
          <h3>Pets available for adoption: </h3>
          <section className='lg-card txt-center'>
            <h4 className='txt-center m-t-0'>Cat</h4>
            {this.state.petsInFront.cat
              ? (
                <>
                  <PetProfile
                    age={this.state.petsInFront.cat.age}
                    breed={this.state.petsInFront.cat.breed}
                    description={this.state.petsInFront.cat.description}
                    gender={this.state.petsInFront.cat.gender}
                    imageURL={this.state.petsInFront.cat.imageURL}
                    name={this.state.petsInFront.cat.name}
                    story={this.state.petsInFront.cat.story}
                  />
                  {renderAdoptButton &&
                    <button
                      className='m-auto'
                      type='submit'
                      disabled={this.state.petsInFront.cat.name == null}
                      onClick={(e) => this.handleAdopt(e, 'cat')}
                    > Adopt
                    </button>}
                </>
              )
              : <p>None available for adoption</p>}
          </section>
          <section className='lg-card m-t-1 txt-center'>
            <h4 className='txt-center m-t-0'>Dog</h4>
            {this.state.petsInFront.dog
              ? (
                <>
                  <PetProfile
                    age={this.state.petsInFront.dog.age}
                    breed={this.state.petsInFront.dog.breed}
                    description={this.state.petsInFront.dog.description}
                    gender={this.state.petsInFront.dog.gender}
                    imageURL={this.state.petsInFront.dog.imageURL}
                    name={this.state.petsInFront.dog.name}
                    story={this.state.petsInFront.dog.story}
                  />
                  {renderAdoptButton &&
                    <button
                      className='m-auto'
                      type='submit'
                      disabled={this.state.petsInFront.dog.name == null}
                      onClick={(e) => this.handleAdopt(e, 'dog')}
                    > Adopt
                    </button>}
                </>
              )
              : <p>None available for adoption</p>}
          </section>
        </article>
      </div >
    );
  }
}

export default Adoption;
