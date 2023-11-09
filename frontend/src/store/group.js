/** Action Type Constants: */
const LOAD_GROUPS = 'groups/loadGroups';
const LOAD_GROUP = 'groups/loadGroup';

/**  Action Creators: */
const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups,
});

const loadGroup = (group) => ({
  type: LOAD_GROUP,
  group,
});

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

  if (response.ok){
    const data = await response.json();
    dispatch(loadGroup(data))
  }
}


const groupsReducer = (state = {}, action) =>{
  switch(action.type){
    case LOAD_GROUPS:
      const groupsState = {}
      action.groups.forEach((group) => {
        groupsState[group.id] = group;
      });
      return {...groupsState};
      case LOAD_GROUP:
        const groupState = action.group
        return groupState;
    default:
      return state
  }
};

export default groupsReducer;
