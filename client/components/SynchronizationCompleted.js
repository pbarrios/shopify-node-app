import React, { Component} from 'react';
import { connect } from 'react-redux';
import { 
    Layout, 
    Card,
    TextContainer,
    Heading,
    Collapsible,
    DescriptionList,
    Link } from '@shopify/polaris';

import { getImportTaskDetails } from '../actions'

class SynchronizationCompleted extends Component {
    constructor(props) {
      super(props);
      this.state = {
        collapsibleOpen: false
      };
    }

    componentDidMount() {
        this.props.dispatch(getImportTaskDetails());
    }

    handleShowLinkClick = () => {
        this.setState({collapsibleOpen: true});
    }

    handleHideLinkClick = () => {
        this.setState({collapsibleOpen: false});
    }

    render() {
        return <Layout>
        <Layout.Section>
          <Card>
            <div style={{margin: "2rem"}}>
                <TextContainer spacing="loose">
                    <Heading>Your doppler account synchronization is completed</Heading>
                    <p>Your Doppler account <strong>{this.props.dopplerAccountName}</strong> is connected to 
                        your Shopify Store with the list <strong>{this.props.dopplerListId}</strong>. All your
                        shopify customers have been imported to your Doppler's list. Every new customer will be added automatically to your Doppler's list.
                    </p>
                    <p>Click <Link onClick={this.handleShowLinkClick}>here</Link> to see the customers import results.</p>
                </TextContainer>
                <Collapsible open={this.state.collapsibleOpen}>
                <DescriptionList
                    items={this.props.importDetails}
                />
                <Link onClick={this.handleHideLinkClick}>Hide</Link>
                </Collapsible>
            </div>
          </Card>
        </Layout.Section>
     </Layout>;
    }
}

function mapStateToProps({
    dopplerAccountName,
    dopplerListId,
    importDetails
  })
  {
    return {
        dopplerAccountName,
        dopplerListId,
        importDetails
      };
  }
export default connect(mapStateToProps)(SynchronizationCompleted);