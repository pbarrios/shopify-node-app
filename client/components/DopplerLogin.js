import React, { Component} from 'react';
import { connect } from 'react-redux';
import { 
    Layout, 
    Image, 
    Stack, 
    Card, 
    TextContainer, 
    TextStyle, 
    FormLayout, 
    TextField, 
    FooterHelp, 
    Link,
    Button } from '@shopify/polaris';
import ShopifyDopplerImage from '../../dist/images/shopify-doppler.png';
import '../../dist/css/DopplerApiKeyInput.css';
import { connectToDoppler } from '../actions';

class DopplerLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
        dopplerAccountName: '',
        dopplerApiKey: '',
    };
  }

  handleClick = () => {
      this.props.dispatch(connectToDoppler(this.state.dopplerAccountName, this.state.dopplerApiKey));
  }

  handleApiKeyChange = (dopplerApiKey) => {
    this.setState({dopplerApiKey});
  }

  handleAccountNameChange = (dopplerAccountName) => {
    this.setState({dopplerAccountName});
  }

  render() {
    return <Layout>
      <Layout.Section>
        <Stack distribution="fill" vertical>
            <Card>
                <Stack distribution="fill" alignment="center" vertical spacing="tight">
                    <Image source={ShopifyDopplerImage} style={{ marginTop: "2rem" }}/>
                    <TextContainer>
                        <TextStyle variation="strong">Connect</TextStyle> {this.props.appName} <TextStyle variation="strong">to your account</TextStyle>
                    </TextContainer>
                    <TextContainer>
                        <TextStyle variation="subdued">{this.props.appName} is a free application that connects your</TextStyle>
                    </TextContainer>
                    <TextContainer>
                        <TextStyle variation="subdued">Shopify store with your Doppler account.</TextStyle>
                    </TextContainer>
                    <div style={{minWidth: "40rem", marginTop: "2rem", marginBottom:"2rem"}}>
                        <FormLayout>
                            <TextField
                                autoFocus
                                label="Account Name" 
                                placeholder="It's your email"
                                type="email" 
                                value={this.state.dopplerAccountName} 
                                onChange={this.handleAccountNameChange}
                                error={this.props.dopplerAccountConnectedError}/>
                            <TextField 
                                label="API Key"
                                placeholder="e.g.: C22CADA13759DB9BBDF93B9D87C14D5A"
                                value={this.state.dopplerApiKey}
                                error={this.props.dopplerAccountConnectedError}
                                onChange={this.handleApiKeyChange} />
                            <Stack distribution="fill" alignment="fill">
                                <Button 
                                    primary
                                    onClick={this.handleClick}
                                    loading={this.props.isConnectingdopplerAccount}
                                    submit>
                                    Connect</Button>
                            </Stack>
                        </FormLayout>
                    </div>
                </Stack>
            </Card>
            <FooterHelp>
                Learn how to get the <Link external={true} url="https://help.fromdoppler.com/en/where-do-i-find-my-api-key">API Key</Link>.
            </FooterHelp>
        </Stack>
      </Layout.Section>
   </Layout>;
  }
}

function mapStateToProps ({ dopplerAccountConnectedError, isConnectingdopplerAccount}) {
 return { dopplerAccountConnectedError, isConnectingdopplerAccount}
}

export default connect(mapStateToProps)(DopplerLogin);
