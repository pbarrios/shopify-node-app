import React, { Component} from 'react';
import { connect } from 'react-redux';
import { 
    Layout, 
    Card,
    Banner } from '@shopify/polaris';

class SynchronizationInProgress extends Component {
    constructor(props) {
      super(props);
    }

    render() {
        return <Layout>
        <Layout.Section>
          <Card>
            <Banner
                title="The synchronization with your Doppler account in progress"
                action={{content: 'Refresh', url: window.location.href}}
                status="info"
                >
                <p>Your Shopify customers are currently being imported to your Doppler list, refresh the page to check the current status.</p>
            </Banner>
          </Card>
        </Layout.Section>
     </Layout>;
    }
}

export default connect()(SynchronizationInProgress);