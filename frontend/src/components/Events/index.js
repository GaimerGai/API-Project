import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { fetchEvents } from "../../store/event";
import { Link } from "react-router-dom";
import EventIndexItem from "./EventsIndexItem";


function Events() {
  const events = useSelector((state) => state.events);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvents()).then(() => setIsLoaded(true))
  }, [dispatch]);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {Object.values(events).map((event) => (
            <Link to={`/events/${event.id}`}>{<EventIndexItem
              event={event}
              key={event.id}
            />}</Link>
        ))}
      </ul>
    </div>
  );
}

export default Events;
