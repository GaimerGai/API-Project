import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { fetchEvents } from "../../store/event";
import { Link } from "react-router-dom";
import EventIndexItem from "./EventsIndexItem";
import '../Events/Events.css'


function Events() {
  const events = useSelector((state) => state.events.events);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvents()).then(() => setIsLoaded(true))
  }, [dispatch]);

  return (
    <div className="container-wrapper">
      <div className="header-links">
        <h2>
          <Link to="/events" className="event-link-on-event-page">
            Events
          </Link>
        </h2>
        <h2>
          <Link to="/groups" className="group-link-on-event-page">
            Groups
          </Link>
        </h2>
      </div>
      <div className="event-container">
        <h3>Events in Meetup</h3>
        <ul className="event-list">
          {Object.values(events).map((event) => (
            <li key={event.id} className="event-list-item">
              <Link to={`/events/${event.id}`}>
                <img src={event.imageSrc} alt={event.name} />
              </Link>
              <div className="text-content">
                <EventIndexItem event={event} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Events;
