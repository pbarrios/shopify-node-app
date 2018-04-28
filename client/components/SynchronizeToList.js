import React, { Component} from 'react';
import { connect } from 'react-redux';
import { 
    Layout, 
    Card,
    Heading,
    TextContainer,
    Select } from '@shopify/polaris';
import { getDopplerLists, synchronizeToList } from '../actions';

class SynchronizeToList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null
    };

    this.handleSynchronizeButtonClick = this.handleSynchronizeButtonClick.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getDopplerLists());
  }
  
  handleSynchronizeButtonClick() {
    this.props.dispatch(synchronizeToList(this.state.selected));
  }

  handleChange = (newValue) => {
    this.setState({selected: newValue});
  }

  render() {
    return <Layout>
      <Layout.Section>
        <Card primaryFooterAction={{content: "Synchronize", onAction: this.handleSynchronizeButtonClick, disabled: !this.props.dopplerLists.length, loading: this.props.isRetrievingDopplerLists || this.props.isSynchronizingList}}>
          <div style={{margin: "2rem"}}>
            <TextContainer spacing="loose">
                <Heading>Sync your store to a Doppler list</Heading>
                <p>Your Doppler is connected to MS. Increase sales by automations such as abandoned carts, product retargeting and order notification emails powered by Doppler.</p>
                <p>Select a list to sync to your store.
                </p>
                <Select options={this.props.dopplerLists}
                        value={this.state.selected} 
                        onChange={this.handleChange}
                        disabled={!this.props.dopplerLists.length || this.props.isRetrievingDopplerLists || this.props.isSynchronizingList }/>
            </TextContainer>
          </div>
        </Card>
      </Layout.Section>
   </Layout>;
  }
}

function mapStateToProps({
  isRetrievingDopplerLists,
  dopplerLists,
  dopplerListSynchronizationError,
  isSynchronizingList,
})
{
  return {
    isRetrievingDopplerLists,
    dopplerLists,
    dopplerListSynchronizationError,
    isSynchronizingList,
  };
}

export default connect(mapStateToProps)(SynchronizeToList);
