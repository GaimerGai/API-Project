import React, { useState, useEffect, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById } from "../../store/event";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";

function EventDetail() {
  const { eventId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const ulRef = useRef();

  const eventData = useSelector((state) => state.events.currEvent);
  const groupData = useSelector((state) => state.groups.currGroup);


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

  // const handleDeleteClick = () => {
  //   setShowDeleteModal(true);
  // };

  // const handleDeleteConfirm = async () => {
  //   await dispatch(deleteSelectedEvent(eventData.id));
  //   history.push(`/events`);
  //   setShowDeleteModal(false);
  // };

  // const handleDeleteCancel = () => {
  //   setShowDeleteModal(false);
  // };

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
            <p>Start Date: {new Date(eventData.startDate).toLocaleString()}</p>
            <p>End Date: {new Date(eventData.endDate).toLocaleString()}</p>
            <p>Price: ${eventData.price}</p>
            <p>{eventData.type === "In person" ? "In Person" : "Online"} Event</p>
            <button>
              <Link to={`/events/${eventData.id}/edit`}>
                Update
              </Link>
            </button>
            <button>
              <OpenModalMenuItem
              itemText="Delete"
              onItemClick={closeMenu}
              modalComponent={<DeleteConfirmationModal entityType='event'/>}
              />
            </button>
          </div>
        </div>
        <div className="bottomcard">{eventData.description}</div>
      </div>
    )
  );
}

export default EventDetail;
