import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Root from '../../pages/root/Root';
import Adoption from '../../pages/adoption/Adoption';
import '../../assets/styles/base.css';

class App extends Component {
  render() {
    return (
      <>
        <header>
          <h1 className='m-l-2'>Petful</h1>
        </header>
        <main className='App' >
          <Switch>
            <Route exact path='/' component={Root} />
            <Route path='/adoption' component={Adoption} />
          </Switch>
        </main>
      </>
    );
  }
}

export default App;