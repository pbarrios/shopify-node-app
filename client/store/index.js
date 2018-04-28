import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

const initState = {
  currentView: window.dopplerImportCompleted ? 4 : (window.dopplerListId ? 3 : (window.dopplerAccountName ? 2 : 0)),
  dopplerAccountName: window.dopplerAccountName,
  dopplerListId: window.dopplerListId,
  
  isConnectingdopplerAccount: false,
  dopplerAccountConnectedError: null,
  
  isSynchronizingList: false,
  dopplerListSelectedError: null,
  
  isRetrievingDopplerLists: false,
  dopplerLists: [],

  importDetails: null
};

function reducer(state = initState, action) {
  switch (action.type) {
    case 'CHANGE_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload.currentView
      };
    case 'START_DOPPLER_ACCOUNT_CONNECTION':
      return {
        ...state,
        dopplerAccountConnectedError: null,
        isConnectingdopplerAccount: true
    };
    case 'DOPPLER_ACCOUNT_CONNECTION_FINISHED':
      return {
        ...state,
        dopplerAccountConnectedError: action.payload.dopplerAccountConnectedError,
        isConnectingdopplerAccount: false
      };
    case 'START_RETRIEVING_DOPPLER_LISTS':
      return {
        ...state,
        isRetrievingDopplerLists: true,
        dopplerLists: []
      };
    case 'DOPPLER_LISTS_RETRIEVED':
      return {
        ...state,
        isRetrievingDopplerLists: false,
        dopplerLists: action.payload.dopplerLists
      };
    case 'START_LIST_SYNCHRONIZATION':
      return {
        ...state,
        dopplerListSynchronizationError: null,
        isSynchronizingList: true
      };
    case 'DOPPLER_LIST_SYNCHRONIZED':
      return {
        ...state,
        dopplerListSynchronizationError: action.payload.dopplerListSynchronizationError,
        isSynchronizingList: false
      };
      case 'IMPORT_DETAILS_RETRIEVED':
      return {
        ...state,
        importDetails: action.payload.importDetails
      };
    default:
      return state;
  }
}

const middleware = applyMiddleware(thunkMiddleware/*, logger*/);

const store = createStore(reducer, middleware);

export default store;
