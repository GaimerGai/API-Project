/** Action Type Constants: */
const LOAD_EVENTS = 'events/loadEvents';
const LOAD_EVENT = 'events/loadEvent';
/**  Action Creators: */
const loadEvents = (events) => ({
  type: LOAD_EVENTS,
  events,
});

const loadEvent = (event) => ({
  type: LOAD_EVENT,
  event,
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

  if (response.ok) {
    const data = await response.json();
    dispatch(loadEvent(data))
  }
}


const eventsReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_EVENTS:
      console.log(action)
      const eventsState = {}
      action.events.forEach((event) => {
        eventsState[event.id] = event;
      });
      return { ...eventsState };
    case LOAD_EVENT:
      const eventState = action.event
      return eventState;
    default:
      return state
  }
};

export default eventsReducer;
