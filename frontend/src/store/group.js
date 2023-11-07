/** Action Type Constants: */
const LOAD_GROUPS = 'groups/loadGroups';

/**  Action Creators: */
const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups,
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
  const response = await fetch(`api/groups/${groupId}`);

  if (response.ok){
    const data = await response.json();
    dispatch(loadGroups(data.Groups.groupId))
  }
}


const groupsReducer = (state = {}, action) =>{
  switch(action.type){
    case LOAD_GROUPS:
      console.log(action)
      const groupsState = {}
      action.groups.forEach((group) => {
        groupsState[group.id] = group;
      });
      return groupsState;
    default:
      return state
  }
};

export default groupsReducer;
