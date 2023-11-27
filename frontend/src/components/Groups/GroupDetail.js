import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById, fetchEventsByGroupId } from "../../store/group";
import { Link, useParams, useHistory } from "react-router-dom";
import { loremIpsum } from "../../App";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import './GroupDetail.css'
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";



function GroupDetail() {
  const history = useHistory();
  const { groupId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session)
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  console.log("this is groupPreviewurl")

  const closeMenu = (e) => {
    if (!ulRef.current?.contains(e.target)) {
      setShowMenu(false);
    }
  };

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
        <div className="group-info-container">
          <div className="backlink">
            <Link to="/groups">Groups</Link>
          </div>
          <div className="group-details">
            <img id="item1" src={groupData?.GroupImages[0]?.url} alt="Group Preview" />
            <h2 id="item2">{groupData.name}</h2>
            <h3 id="item3">
              {groupData.city}, {groupData.state}
            </h3>
            <p id="item4">Number of Events: {groupData.numEvents} • {isPrivate}</p>
            <p id="item5">Organized by: {groupData.Organizer.firstName} {groupData.Organizer.lastName}</p>
            {session.user && (
              <div className="group-buttons">
                {session.user.id !== groupData.Organizer.id && (
                  <button id="item6" className="join-group-button" onClick={handleJoinGroup}>
                    Join this group
                  </button>
                )}
                {session.user.id === groupData.Organizer.id && (
                  <>
                    <button id="item7" onClick={handleCreateEvent}>
                      Create An Event
                    </button>
                    <button id="item8">
                      <Link to={`/groups/${groupData.id}/edit`}>Update</Link>
                    </button>
                    <button id="item9">
                      <OpenModalMenuItem
                        itemText="Delete"
                        onItemClick={closeMenu}
                        modalComponent={<DeleteConfirmationModal entityType='group' />}
                      />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>


        <div className="group-details-container">
          <div className="organizer-info">
            <h2>Organizer</h2>
            <p>{groupData.Organizer.firstName} {groupData.Organizer.lastName}</p>
          </div>

          <div className="about-info">
            <h2>What We're About</h2>
            <p>{groupData.about}</p>
          </div>

          <div className="events-container">
            {upcomingEvents.length > 0 && (
              <div className="upcoming-events">
                <h2>Upcoming Events</h2>
                {upcomingEvents.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="event-link">
                    <div key={event.id} className="event-card">
                      <img id="item10" src={event.previewImage} alt={event.name} />
                        <p id="item11">Date: {new Date(event.startDate).toLocaleDateString()}</p>
                        <p id="item12">Time: {new Date(event.startDate).toLocaleTimeString()}</p>
                        <h3 id="item13">{event.name}</h3>
                        <p id="item14">Location: {event.Venue ? event.Venue.city : "Online"}</p>
                        <p id="item15">{event.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pastEvents.length > 0 && (
              <div className="past-events">
                <h2>Past Events</h2>
                {pastEvents.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="event-link">
                    <div key={event.id} className="event-card">
                      <img src={event.previewImage} alt={event.name} />
                      <div className="event-details">
                        <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                        <p>Time: {new Date(event.startDate).toLocaleTimeString()}</p>
                        <h3>{event.name}</h3>
                        <p>Location: {event.Venue ? event.Venue.city : "Online"}</p>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}

export default GroupDetail;
