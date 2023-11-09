/** Action Type Constants: */
const LOAD_EVENTS = 'events/loadEvents';

/**  Action Creators: */
const loadEvents = (events) => ({
  type: LOAD_EVENTS,
  events,
});

/** Thunk Action Creators: */
// Get All events
export const fetchEvents = () => async (dispatch) => {
  const response = await fetch('/api/events');

  if (response.ok) {
    const data = await response.json();
    dispatch(loadEvents(data.Events))
  }
}

//Get details of a event from an id
export const fetchEventById = (eventId) => async (dispatch) => {
  const response = await fetch(`/api/events/${eventId}`);

  if (response.ok){
    const data = await response.json();
    dispatch(loadEvents(data.Events.eventId))
  }
}


const eventsReducer = (state = {}, action) =>{
  switch(action.type){
    case LOAD_EVENTS:
      console.log(action)
      const eventsState = {}
      action.events.forEach((event) => {
        eventsState[event.id] = event;
      });
      return {...eventsState};
    default:
      return state
  }
};

export default eventsReducer;
