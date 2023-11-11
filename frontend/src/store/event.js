/** Action Type Constants: */
const LOAD_EVENTS = 'events/loadEvents';
const LOAD_EVENT = 'events/loadEvent';
const CREATE_EVENT = 'events/createEvent';
const UPDATE_EVENT = 'events/updateEvent';
const DELETE_EVENT = 'events/deleteEvent';


/**  Action Creators: */
const loadEvents = (events) => ({
  type: LOAD_EVENTS,
  events,
});

const loadEvent = (event) => ({
  type: LOAD_EVENT,
  event,
});

const createEvent = (payload) => ({
  type: CREATE_EVENT,
  payload,
});

const updateEvent = (payload) => ({
  type: UPDATE_EVENT,
  payload,
});

const deleteEvent = (event) => ({
  type: DELETE_EVENT,
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


const eventsReducer = (state = { events: {}, currEvent: {} }, action) => {
  switch (action.type) {
    case LOAD_EVENTS:
      const eventsState = {};
      action.events.forEach((event) => {
        eventsState[event.id] = event;
      });
      return { ...state, events: eventsState };

    case LOAD_EVENT:
      return { ...state, currEvent: action.event }

    case CREATE_EVENT: {
      const events = { ...state.events }
      events[action.event.id] = action.event
      return { ...state, events };
    }

    case UPDATE_EVENT: {
      const events = { ...state.events }
      events[action.event.id] = action.event
      return { ...state, events };
    }
    case DELETE_EVENT:
      const newState = { ...state };
      delete newState[action.eventId];
      return newState;

    default:
      return state;
  }
};

export default eventsReducer;
