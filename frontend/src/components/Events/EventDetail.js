import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById } from "../../store/event";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import '../Events/EventDetail.css';

function EventDetail() {
  const { eventId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const ulRef = useRef();

  const eventData = useSelector((state) => state.events.currEvent);
  const groupData = useSelector((state) => state.groups.currGroup);
  console.log("This is eventData:", eventData)
  console.log("This is GroupData:", groupData)
  const session = useSelector((state) => state.session)



  const closeMenu = (e) => {
    if (!ulRef.current?.contains(e.target)) {
      setShowMenu(false);
    }
  };

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

  return (
    isLoaded && (
      <div className="web-page">
        <div className="breadcrumb">
          <Link to="/events">Events</Link>
          <h2>{eventData.name}</h2>
          <p className="host-text">
            Hosted by: {eventData.hostFirstName} {eventData.hostLastName}
          </p>
        </div>
        <div className="event-details">
          <div className="left-section">
            <img src={eventData?.EventImages && eventData.EventImages[0]?.url} alt="Event Preview" />
          </div>
          <div className="right-section">
            <div className="groupCard">
              <Link to={`/groups/${groupData.id}`}>
                <img src={groupData?.GroupImages && groupData.GroupImages[0]?.url} alt="Group Preview" />
                <h4>{groupData.name}</h4>
                <p>{groupData.isPublic ? "Public Group" : "Private Group"}</p>
              </Link>
            </div>
            <div className="eventinfocard">
              <div className="time">
                <i className="fa-solid fa-clock"></i>
                <div className="time-details">
                  <p>Start Date: {new Date(eventData.startDate).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                  }).replace(',', '\u00b7')}</p>
                  <p>End Date: {new Date(eventData.endDate).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                  }).replace(',', '\u00b7')}</p>
                </div>
              </div>
              <div className="price">
                <i className="fa-solid fa-dollar-sign"></i>
                <p>{eventData.price === 0.00 ? "FREE" : eventData.price}</p>
              </div>
              <div className="location">
                <i className="fa-solid fa-map-pin"></i>
                <p>{eventData.type === "In person" ? "In Person" : "Online"} Event</p>
              </div>
              {session.user && (session.user.id === eventData.organizerId || session.user.id === groupData.organizerId) && (
                <>
                  <button>
                    <Link to={`/events/${eventData.id}/edit`}>Update</Link>
                  </button>
                  <button>
                    <OpenModalMenuItem
                      itemText="Delete"
                      onItemClick={closeMenu}
                      modalComponent={<DeleteConfirmationModal entityType='event' />}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="description">
          <h3>Details</h3>
          <p>{eventData.description}</p>
        </div>
      </div>
    )
  );
}

export default EventDetail;
