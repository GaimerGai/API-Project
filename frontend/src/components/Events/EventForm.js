import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { postNewEvent, updateExistingEvent } from '../../store/event';
import { fetchGroupById } from '../../store/group';
import '../Events/EventForm.css';


const EventForm = ({ event, formType }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();

  const userData = useSelector((state) => state.session.user);
  console.log("Event prop:", event);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [name, setName] = useState(event?.name || '');
  const [about, setAbout] = useState(event?.description || '');
  const [onlineStatus, setOnlineStatus] = useState(event?.type || '');
  const [price, setPrice] = useState(event?.price || '');
  const [startTime, setStartTime] = useState(event?.startDate ? formatDateTime(event.startDate) : '');
  const [endTime, setEndTime] = useState(event?.endDate ? formatDateTime(event.endDate) : '');
  const [imageUrl, setImageUrl] = useState((event?.EventImages && event?.EventImages[0]?.url) || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userData){
      history.push('/')
    }
  }, [])

  useEffect(() => {
    dispatch(fetchGroupById(groupId));
  }, [dispatch, groupId]);

  const groupData = useSelector((state) => state.groups.currGroup);

  const validateForm = () => {
    const newErrors = {};


    const startTimeDate = new Date(startTime).getTime();
    const endTimeDate = new Date(endTime).getTime();

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 60) {
      newErrors.name = 'Name must be 60 characters or less';
    }

    if (about.length < 30) {
      newErrors.about = 'About needs 30 or more characters';
    }

    if (startTimeDate >= endTimeDate) {
      newErrors.startTime = 'Start time must be before end time';
      newErrors.endTime = 'End time must be after start time';
    }

    if (!onlineStatus) {
      newErrors.onlineStatus = "Please select an option for Online Status";
    }

    if (!price.trim()) {
      newErrors.price = "Please select a price"
    }

    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Please provide a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }



    const eventData = {
      groupId: groupData.id,
      venueId: 1,
      name: name,
      type: onlineStatus,
      capacity: 100,
      price: price,
      description: about,
      hostFirstName: userData.firstName,
      hostLastName: userData.lastName,
      startDate: startTime,
      endDate: endTime,
      previewImage: imageUrl,
    }

    let newEvent;

    if (formType === "Update Event") {
      newEvent = await dispatch(updateExistingEvent({ ...event, ...eventData }))
    } else {
      newEvent = await dispatch(postNewEvent(eventData))
    }

    if (newEvent.id) {
      history.push(`/events/${newEvent.id}`);
    } else {
      const { errors } = await newEvent.json();
      setErrors(errors);
    }

  };

  return (
    <form onSubmit={handleSubmit} className="event-form-container">
      <div className='name-instructions section-divider'>
        <h3>{formType === "Update Event" ? `Update an Event for ${groupData.name}` : `Create an Event for ${groupData.name}`}</h3>
        <h2>What is the name of your event</h2>
        <label>
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.name && <div className="error-text">{errors.name}</div>}
      </div>

      <div className='statuses-and-url section-divider'>
        <h3>Is this an in-person or online event?</h3>
        <label>
          <select
            value={onlineStatus}
            onChange={(e) => setOnlineStatus(e.target.value)}
            className="input-box"
          >
            <option value="" disabled>
              (Select One)
            </option>
            <option value="Online">Online</option>
            <option value="In person">In Person</option>
          </select>
        </label>
        {errors.onlineStatus && <div className="error-text">{errors.onlineStatus}</div>}

        <h3>What is the price for your event?</h3>
        <label>
          <input
            type="text"
            placeholder="$    0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.price && <div className="error-text">{errors.price}</div>}
      </div>

      <div className='times section-divider'>
        <h3>When does your event start?</h3>
        <label>
          <input
            type="datetime-local"
            placeholder="MM/DD/YYYY HH:mm AM"
            value={startTime}
            min={new Date()}
            onChange={(e) => setStartTime(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.startTime && <div className="error-text">{errors.startTime}</div>}

        <h3>When does your event end?</h3>
        <label>
          <input
            type="datetime-local"
            placeholder="MM/DD/YYYY HH:mm PM"
            value={endTime}
            min={startTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.endTime && <div className="error-text">{errors.endTime}</div>}
      </div>

      <div className='imageUrl section-divider'>
        <h3>Please add an image URL for your event below:</h3>
        <label>
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.imageUrl && <div className="error-text">{errors.imageUrl}</div>}
      </div>

      <div className='about-instructions section-divider'>
        <h2>Please describe your event:</h2>
        <label>
          <textarea
            placeholder="Please include at least 30 characters"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="input-box"
          />
        </label>
        {errors.about && <div className="error-text">{errors.about}</div>}
      </div>
      <button type="submit" className="submit-button">
        {formType === "Update Event" ? "Update Event" : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;
