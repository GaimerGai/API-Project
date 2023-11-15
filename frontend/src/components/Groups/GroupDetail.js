import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById, fetchEventsByGroupId, deleteSelectedGroup } from "../../store/group";
import { Link, useParams, useHistory } from "react-router-dom";
import { loremIpsum } from "../../App";



function GroupDetail() {
  const history = useHistory();
  const { groupId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupById(groupId))
      .then(() => dispatch(fetchEventsByGroupId(groupId)))
      .then(() => setIsLoaded(true));
  }, [dispatch, groupId]);

  const groupData = useSelector((state) => state.groups.currGroup);
  const eventData = useSelector((state) => state.groups.Events)

  console.log("This is GROUPData:", groupData)
  console.log("This is eventData:", eventData)

  let isPrivate = '';
  if (groupData.private) isPrivate = 'Private';
  if (!groupData.private) isPrivate = 'Public'

  const handleJoinGroup = () => {
    alert("Feature Coming Soon");
  };

  const handleDelete = () => {
    dispatch(deleteSelectedGroup(groupData.id));
    history.push(`/groups`)
  };


  const handleCreateEvent = () => {
    history.push(`/groups/${groupId}/events/new`)
  };

  const now = new Date();
  const upcomingEvents = Object.values(eventData).filter((event) => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));;
  console.log("this is upcomingEvents:", upcomingEvents)
  const pastEvents = Object.values(eventData).filter((event) => new Date(event.startDate) <= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));;
  console.log("this is pastEvents:", pastEvents)

  return (
    isLoaded && (
      <div className="web-page">
        <div className="backlink">
          <Link to="/groups">Groups</Link>
        </div>
        <div className="topCard">
          <h2>{groupData.name}</h2>
          <h3>
            {groupData.city}, {groupData.state}
          </h3>
          <p>Number of Events: {groupData.numEvents} * {isPrivate}</p>
          <p>
            Organized by: {groupData.Organizer.firstName} {groupData.Organizer.lastName}
          </p>
          <button onClick={handleJoinGroup}>Join this group</button>
          <button onClick={handleCreateEvent}>Create An Event</button>
          <button>
          <Link to={`/groups/${groupData.id}/edit`}>
          Update
          </Link>
          </button>
          <button onClick={handleDelete}>Delete</button>
        </div>
        <div className="middleCard">
          <h2>Organizer</h2>
          <p>{groupData.Organizer.firstName} {groupData.Organizer.lastName}</p>
          <h2>What We're about</h2>
          <p>{loremIpsum}</p>
        </div>
        <div className="eventsCard">
          {upcomingEvents.length > 0 && (
            <div className="upcoming-Events">
              <h2>Upcoming Events</h2>
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>Title: {event.name}</h3>
                  <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                  <p>Time: {new Date(event.startDate).toLocaleTimeString()}</p>
                  <img src={event.previewImage} alt={event.name} />
                  <p>Location: {event.Venue ? event.Venue.city : "Online"}</p>
                  <p>Description: {event.description}</p>
                </div>
              ))}
            </div>
          )}
          {pastEvents.length > 0 && (
            <div className="past-Events">
              <h2>Past Events</h2>
              {pastEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>Title: {event.name}</h3>
                  <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                  <p>Time: {new Date(event.startDate).toLocaleTimeString()}</p>
                  <img src={event.previewImage} alt={event.name} />
                  <p>Location: {event.Venue ? event.Venue.city : "Online"}</p>
                  <p>Description: {event.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default GroupDetail;
