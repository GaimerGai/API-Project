import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById } from "../../store/event";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";



function EventDetail() {
  const { eventId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  const eventData = useSelector((state) => state.events.currEvent);
  const groupData = useSelector((state) => state.groups.currGroup)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchEventById(eventId));
        await dispatch(fetchGroupById(eventData.groupId));
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, eventId, eventData.groupId]);



  console.log("This is eventData:", eventData)
  console.log("This is groupData:", groupData)


  let isPrivate = '';
  if (eventData.private) isPrivate = 'Private';
  if (!eventData.private) isPrivate = 'Public'


  return (
    isLoaded && (
      <div className="web-page">
        <div className="backlink">
          <Link to="/events">Events</Link>
        </div>
        <div className="topcard">
          <h2>{eventData.name}</h2>
          <h3>Hosted by: {eventData.hostFirstName} {eventData.hostLastName}</h3>
        </div>
        <img src={eventData.previewImage} alt="Event Preview" />
        <div className="middlecard">
          <div className="groupCard">
            <img src={groupData.previewImage} alt="Group Preview" />
            <h4>{groupData.name}</h4>
            <p>{groupData.isPublic ? "Public Group" : "Private Group"}</p>
          </div>
          <div className="eventinfocard">
          <p>Start Date: {eventData.startDate.toLocaleString()}</p>
          <p>End Date: {eventData.endDate.toLocaleString()}</p>
          <p>Price: ${eventData.price}</p>
          <p>{eventData.type === "In person" ? "In Person" : "Online"} Event</p>
          </div>
        </div>
        <div className="bottomcard">{eventData.description}</div>
      </div>
    )
  );
}

export default EventDetail;
