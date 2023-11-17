import React, { useState, useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSelectedEvent, fetchEventById } from "../../store/event";
import { fetchGroupById } from "../../store/group";
import { Link, useParams, useHistory } from "react-router-dom";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

function EventDetail() {
  const { eventId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const eventData = useSelector((state) => state.events.currEvent);
  const groupData = useSelector((state) => state.groups.currGroup);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteSelectedEvent(eventData.id));
    history.push(`/events`);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

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
            <button onClick={handleDeleteClick}>Delete</button>
          </div>
        </div>
        <div className="bottomcard">{eventData.description}</div>
        {showDeleteModal && (
          <DeleteConfirmationModal
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            itemName={eventData.name}
          />
        )}
      </div>
    )
  );
}

export default EventDetail;
