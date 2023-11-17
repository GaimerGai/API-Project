import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { postNewEvent, updateExistingEvent } from '../../store/event';
import { fetchGroupById } from '../../store/group';


const EventForm = ({ event, formType }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();

  const userData = useSelector((state) => state.session.user);

  const [name, setName] = useState(event?.name || '');
  const [about, setAbout] = useState(event?.about || '');
  const [onlineStatus, setOnlineStatus] = useState(event?.onlineStatus || '');
  const [price, setPrice] = useState(event?.price || '');
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchGroupById(groupId));
  }, [dispatch, groupId]);

  const groupData = useSelector((state) => state.groups.currGroup);

  const validateForm = () => {
    const newErrors = {};

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

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

    const parseTimeDateString = (dateTimeString) => {
      const [datePart, timePart, ampm] = dateTimeString.split(' ');
      const [month, day, year] = datePart.split('/')
      const [hours, minutes] = timePart.split(/:| /);
      if (!ampm) {
        const lastChar = hours.slice(-2).toUpperCase();
        if (lastChar === 'AM' || lastChar === 'PM') {
          ampm = lastChar;
          hours = hours.slice(0, -2);
        }
      }
      const militaryHours = ampm.toUpperCase() === 'PM' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
      const parsedDate = new Date(year, month -1, day, militaryHours, minutes);
      return parsedDate;
    }

    const startTimeDate = parseTimeDateString((startTime));
    const endTimeDate = parseTimeDateString((endTime));


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
      startDate: startTimeDate,
      endDate: endTimeDate,
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
    <form onSubmit={handleSubmit}>
      <div className='name-instructions'>
        <h3>Create an Event for {groupData.name}</h3>
        <h2>What is the name of your event</h2>
        <label>
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {errors.name && <div className="errors">{errors.name}</div>}
      </div>

      <div className='statuses-and-url'>
        <h3>Is this an in person or online event?</h3>
        <label>
          <select
            value={onlineStatus}
            onChange={(e) => setOnlineStatus(e.target.value)}
          >
            <option value="" disabled>
              (Select One)
            </option>
            <option value="Online">Online</option>
            <option value="In person">In Person</option>
          </select>
        </label>
        {errors.onlineStatus && <div className="errors">{errors.onlineStatus}</div>}

        <h3>What is the price for your event?</h3>
        <label>
          <input
            type="text"
            placeholder="$    0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        {errors.privacy && <div className="errors">{errors.privacy}</div>}
      </div>

      <div className='times'>
        <h3>When does your event start?</h3>
        <label>
          <input
            type="text"
            placeholder="MM/DD/YYYY HH:mm AM"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        {errors.startTime && <div className="errors">{errors.startTime}</div>}

        <h3>When does your event end?</h3>
        <label>
          <input
            type="text"
            placeholder="MM/DD/YYYY HH:mm PM"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
        {errors.endTime && <div className="errors">{errors.endTime}</div>}
      </div>

      <div className='imageUrl'>
        <h3>Please add in image url for your group below:</h3>
        <label>
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        {errors.imageUrl && <div className="errors">{errors.imageUrl}</div>}
      </div>

      <div className='about-instructions'>
        <h2>Please describe your event:</h2>
        <label>
          <textarea
            placeholder="Please include at least 30 characters"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </label>
        {errors.about && <div className="errors">{errors.about}</div>}
      </div>


      <button type="submit">Create Event</button>
    </form>
  );
};

export default EventForm;
