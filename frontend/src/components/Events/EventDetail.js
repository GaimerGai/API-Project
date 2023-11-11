import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById } from "../../store/event";
import { Link, useParams } from "react-router-dom";



function EventDetail() {
  const { eventId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEventById(eventId)).then(() => setIsLoaded(true));
  }, [dispatch, eventId]);

  const data = useSelector((state) => state.events.currEvent);
  console.log("This is data:",data)

  let isPrivate = '';
  if (data.private) isPrivate = 'Private';
  if (!data.private) isPrivate = 'Public'

  return (
    isLoaded && (
      <div className="web-page">
        <div className="backlink">
          <Link to="/events">Events</Link>
        </div>
        <div className="topcard">
          <h2>Event Details</h2>
          <h2>{data.name}</h2>
          <h2>{}</h2>

        </div>
        <div>

        </div>
      </div>
    )
  );
}

export default EventDetail;
