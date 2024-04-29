import { ReducerData, ReduxActionData } from '../../types/reducers';
import { DATA_ACTIONS } from '../actions/data';

const initialState: ReducerData = {
  contents: [],
};

const dataState: (state: ReducerData, action: ReduxActionData<any>) => ReducerData = (
  state = initialState,
  action: ReduxActionData<any>
) => {
  if (action.type === DATA_ACTIONS.SET_CONTENTS) {
    return {
      ...state,
      contents: action.payload,
    };
  } else {
    return state;
  }
};

export default dataState;
