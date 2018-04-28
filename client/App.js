import React, { Component} from 'react';
import {connect} from 'react-redux';
import { EmbeddedApp } from '@shopify/polaris/embedded';
import { Page } from '@shopify/polaris';

import ConnectToDoppler from './components/ConnectToDoppler';
import DopplerLogin from './components/DopplerLogin';
import SynchronizeToList from './components/SynchronizeToList';
import SynchronizationInProgress from './components/SynchronizationInProgress';
import SynchronizationCompleted from './components/SynchronizationCompleted';

import Icon from '../dist/images/doppler-icon.png'

class App extends Component {
  constructor(props) {
    super(props)
  }

  switchComponent() {
    switch (this.props.currentView) {
      case 0: return <ConnectToDoppler/>;
      case 1: return <DopplerLogin appName="Doppler for Shopify"/>;
      case 2: return <SynchronizeToList/>;
      case 3: return <SynchronizationInProgress/>;
      case 4: return <SynchronizationCompleted/>;
      default: <ConnectToDoppler/>;
    }
  }

  render() {
    const { apiKey, shopOrigin } = window;
    return (
      <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
        <Page icon={Icon}>
        {this.switchComponent()}
        </Page>
      </EmbeddedApp>
    );
  }
}

function mapStateToProps({ currentView })
{
  return { currentView };
}

export default connect(mapStateToProps)(App);
