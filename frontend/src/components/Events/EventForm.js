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
  const [privacy, setPrivacy] = useState(event?.privacy || '');
  const [price, setPrice] = useState(event?.price ||  '');
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

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 60) {
      newErrors.name = 'Name must be 60 characters or less';
    }

    if (about.length < 30) {
      newErrors.about = 'About needs 30 or more characters';
    }


    if (!onlineStatus) {
      newErrors.onlineStatus = "Please select an option for Online Status";
    }

    if (!privacy) {
      newErrors.privacy = "Please select an option for Privacy";
    }

    if (!price.trim()){
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
      organizerId: userData.id,
      name: name,
      about: about,
      type: onlineStatus,
      private: privacy === 'private',
      price:price,
      previewImage: imageUrl,
    }

    console.log("this is eventData:", eventData)

    let newEvent;

    if (formType === "Update Event") {
      newEvent = await dispatch(updateExistingEvent({...event, ...eventData}))
    } else {
      newEvent = await dispatch(postNewEvent(eventData))
    }

    if (newEvent.id) {
      history.push(`/groups/${newEvent.id}`);
    } else {
      const { errors } = await newEvent.json();
      setErrors(errors);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='name-instructions'>
      <h3>Create an Event for {}</h3>
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

        <h3>Is this event private or public</h3>
        <label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="" disabled>
              (Select One)
            </option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
        {errors.privacy && <div className="errors">{errors.privacy}</div>}

        <h3>What is the price for your event?</h3>
        <label>
          <input
            type="text"
            placeholder="$    0"
            value={name}
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
