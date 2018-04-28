export function getImportTaskDetails() {
  return sendRequest({
    verb: 'GET',
    path: '/import-task-details'
  },{
    requestCompleteAction: json => {
      console.debug(json);
      return { type: 'IMPORT_DETAILS_RETRIEVED', payload: { 
        importDetails: [
          { term: "List Id", description: json.listId },
          { term: "Delete Custom Fields Data", description: json.deleteCustomFieldsData },
          { term: "Status", description: json.status },
          { term: "Number Of Attempts", description: json.numberOfAttempts },
          { term: "Date Last Imported", description: json.dateLastImported },
          { term: "Processed", description: json.processed },
          { term: "Invalid Emails", description: json.invalidEmails },
          { term: "Soft Bounceds", description: json.softBounceds },
          { term: "Hard Bounceds", description: json.hardBounceds },
          { term: "Subscriber Bounceds", description: json.subscriberBounceds },
          { term: "Amount Headers And Fields Dont Match", description: json.amountHeadersAndFieldsDontMatch },
          { term: "Never Open Bounceds", description: json.neverOpenBounceds },
          { term: "Updated", description: json.updated },
          { term: "New Subscribers", description: json.newSubscribers },
          { term: "Duplicated", description: json.duplicated },
          { term: "Unsubscribed By User", description: json.unsubscribedByUser },
          { term: "Users In Blacklist", description: json.usersInBlackList },
          { term: "Duplicated Field", description: json.duplicatedField }
        ]
      } };
    },
  });
}

export function synchronizeToList(listId) {
  return sendRequest({
    verb: 'POST',
    path: '/sync-to-list',
    params: JSON.stringify({listId})
  },{
    requestStartAction: () => {
      return { type: 'START_LIST_SYNCHRONIZATION' };
    },
    requestCompleteAction: json => { return changeCurrentViewAction(3)},
   });
}

export function getDopplerLists() {
  return sendRequest({
    verb: 'GET',
    path: '/doppler-lists'
  },{
    requestStartAction: () => {
      return { type: 'START_RETRIEVING_DOPPLER_LISTS' };
    },
    requestCompleteAction: json => {
      return { type: 'DOPPLER_LISTS_RETRIEVED', payload: { 
        dopplerLists: json.map(list => { return {value: list.listId, label: list.name}; })
      } };
    },
    requestErrorAction: () => {}
  });
}

export function connectToDoppler(dopplerAccountName, dopplerApiKey) {
  return sendRequest({
    verb: 'POST',
    path: '/connect-to-doppler',
    params: JSON.stringify({ dopplerAccountName, dopplerApiKey })
  }, {
    requestStartAction: () => {
      return { type: 'START_DOPPLER_ACCOUNT_CONNECTION' };
    },
    requestCompleteAction: json => {
      if (json.success)
        return changeCurrentViewAction(2);
      return {
        type: 'DOPPLER_ACCOUNT_CONNECTION_FINISHED',
        payload: {
          dopplerAccountConnectedError: json.body && json.body !== '' ? json.body : 'Unexpected error'
        }
      };
    },
    requestErrorAction: (error) => {
      return {
        type: 'DOPPLER_ACCOUNT_CONNECTION_FINISHED',
        payload: {
          dopplerAccountConnectedError: 'Unexpected error'
        }
      };
    }
  });
}

export function changeCurrentViewAction(currentView) {
  return {
    type: 'CHANGE_CURRENT_VIEW',
    payload: {
      currentView
    }
  };
}

export function sendRequest(requestFields, requestActions) {
  const { verb, path, params } = requestFields;
  const { requestStartAction, requestCompleteAction, requestErrorAction } = requestActions;

  const fetchOptions = {
    method: verb,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
  }

  if (verb !== 'GET') {
    fetchOptions['body'] = params
  }

  return dispatch => {
    if (requestStartAction)
      dispatch(requestStartAction());

    return fetch(path, fetchOptions)
      .then(response => response.json())
      .then(json => {
        if (requestCompleteAction)
          dispatch(requestCompleteAction(json));
      })
      .catch(error => {
        if (requestErrorAction)
          dispatch(requestErrorAction(error));
      });
  };
}
