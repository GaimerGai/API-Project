import { csrfFetch } from "./csrf";

/** Action Type Constants: */
const LOAD_GROUPS = 'groups/loadGroups';
const LOAD_GROUP = 'groups/loadGroup';
const CREATE_GROUP = 'groups/createGroup';
const UPDATE_GROUP = 'groups/updateGroup';
const DELETE_GROUP = 'groups/deleteGroup';
const GET_EVENT_BY_GROUP = 'groups/getEventsByGroup'

/**  Action Creators: */
const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups,
});

const loadGroup = (group) => ({
  type: LOAD_GROUP,
  group,
});

const createGroup = (payload) => ({
  type: CREATE_GROUP,
  payload,
});

const updateGroup = (payload) => ({
  type: UPDATE_GROUP,
  payload,
});

const deleteGroup = (group) => ({
  type: DELETE_GROUP,
  group,
});

const getEventsByGroup = (group) => ({
  type: GET_EVENT_BY_GROUP,
  group
})

/** Thunk Action Creators: */
// Get All Groups
export const fetchGroups = () => async (dispatch) => {
  const response = await fetch('/api/groups');

  if (response.ok) {
    const data = await response.json();
    dispatch(loadGroups(data.Groups))
  }
}

//Get details of a Group from an id
export const fetchGroupById = (groupId) => async (dispatch) => {
  const response = await fetch(`/api/groups/${groupId}`);

  if (response.ok) {
    const data = await response.json();
    dispatch(loadGroup(data))
  }
}

//Get all Events by Group ID
export const fetchEventsByGroupId = (groupId) => async dispatch => {
  const response = await fetch(`/api/groups/${groupId}/events`);

  if (response.ok) {
    const data = await response.json();
    dispatch(getEventsByGroup(data))
  }
}

export const postNewGroup = (payload) => async (dispatch) => {
  console.log("This is payload in the thunk:", payload)
  const response = await csrfFetch(`/api/groups`, {
    method: "POST",
    headers: {"Content-Type":"application.json"},
    body: JSON.stringify(payload)
  });

  if (response.ok){
    console.log("This is the payload if the response is ok:", payload)
    const data = await response.json();
    dispatch(createGroup(data))
    return data;
  }
  return response;
}

export const updateExistingGroup = (payload) => async (dispatch) => {
  const response = await fetch(`/api/groups/${payload.id}`, {
    method: "PUT",
    headers: {"Content-Type":"application.json"},
    body: JSON.stringify(payload)
  });

  if (response.ok){
    const data = await response.json();
    dispatch(updateGroup(data))
    return data;
  }
  return response;
}

export const deleteSelectedGroup = (groupId) => async (dispatch) => {
  const res = await fetch(`/api/groups/${groupId}`, {
      method: "DELETE",
  });

  if (res.ok) {
      const data = await res.json();
      dispatch(deleteGroup(groupId));
      return data;
  }
  return res;
};

const groupsReducer = (state = { groups: {}, currGroup: {}, Events: {} }, action) => {
  switch (action.type) {
    case LOAD_GROUPS:
      const groupsState = {};
      action.groups.forEach((group) => {
        groupsState[group.id] = group;
      });
      return { ...state, groups: groupsState };

    case LOAD_GROUP:
      return { ...state, currGroup: action.group }

    case CREATE_GROUP: {
      const groups = { ...state.groups }
      groups[action.group.id] = action.group
      return { ...state, groups };
    }

    case UPDATE_GROUP: {
      const groups = { ...state.groups }
      groups[action.group.id] = action.group
      return { ...state, groups };
    }
    case DELETE_GROUP:
      const newState = { ...state };
      delete newState[action.groupId];
      return newState;

    case GET_EVENT_BY_GROUP:{
      let event = {...state.Events}
      event = action.group.Events
      return {...state,Events:event}
    }

    default:
      return state;
  }
};

export default groupsReducer;
