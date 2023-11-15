import { csrfFetch } from "./csrf";
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

export const postNewEvent = (payload) => async (dispatch) => {
  console.log("This is payload in the thunk:", payload)
  const response = await csrfFetch(`/api/groups/${payload.groupId}/events`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (response.ok){
    console.log("This is the payload if the response is ok:", payload)
    const data = await response.json();
    dispatch(createEvent(data))
    return data;
  }
  return response;
}

export const updateExistingEvent = (payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/events/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  if (response.ok){
    const data = await response.json();
    dispatch(updateEvent(data))
    return data;
  }
  return response;
}

export const deleteSelectedEvent = (eventId) => async (dispatch) => {
  const res = await csrfFetch(`/api/event/${eventId}`, {
      method: "DELETE",
  });

  if (res.ok) {
      const data = await res.json();
      dispatch(deleteEvent(eventId));
      return data;
  }
  return res;
};

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
      events[action.payload.id] = action.payload
      return { ...state, events };
    }

    case UPDATE_EVENT: {
      const events = { ...state.events }
      events[action.payload.id] = action.payload
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
