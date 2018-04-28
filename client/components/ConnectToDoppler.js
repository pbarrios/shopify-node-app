import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Layout, ButtonGroup, Button, TextContainer, DisplayText, TextStyle, Image } from '@shopify/polaris';

import { changeCurrentViewAction } from '../actions';

import ConnectedImage from '../../dist/images/connected.svg';

class ConnectToDoppler extends Component {
  constructor(props) {
    super(props);
    this.handleConnectButtonClick = this.handleConnectButtonClick.bind(this);
  }

  handleConnectButtonClick() {
    this.props.dispatch(changeCurrentViewAction(1));
  }

  render() {
    return <Layout>
      <Layout.Section>
        <div style={{ marginTop: "2rem" }}>
          <TextContainer spacing="loose">
            <DisplayText size="large">Connect your Doppler account</DisplayText>
            <TextStyle variation="subdued">
              <DisplayText size="small" >Streamline your workflow, sync customer data,
              generate more revenue, and grow your business.</DisplayText>
            </TextStyle>
          </TextContainer>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <ButtonGroup>
            <Button onClick={this.handleConnectButtonClick} primary>Connect to Doppler</Button>
            <Button external url="https://app2.fromdoppler.com/Registration/Register/StartRegistration/">Create new account</Button>
          </ButtonGroup>
        </div>
      </Layout.Section>
      <Layout.Section secondary>
        <Image source={ConnectedImage}/>
      </Layout.Section>
   </Layout>;
  }
}

export default connect()(ConnectToDoppler);
