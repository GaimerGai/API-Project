import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { postNewGroup, updateExistingGroup } from '../../store/group';

const GroupForm = ({ group, formType }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const userData = useSelector((state) => state.session.user);
  console.log("This is userData", userData)

  const [city, setCity] = useState(group?.city || '');
  const [state, setState] = useState(group?.state || '');
  const [name, setName] = useState(group?.name || '');
  const [about, setAbout] = useState(group?.about || '');
  const [onlineStatus, setOnlineStatus] = useState(group?.type || '');
  const [privacy, setPrivacy] = useState(group?.private === false ? 'true' : 'false' || '')
  const [imageUrl, setImageUrl] = useState(group?.GroupImages[0].url || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userData || (formType === 'Update Group' && (group.organizerId !== userData.id))){
      history.push('/')
    }
  }, [])


  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 60) {
      newErrors.name = 'Name must be 60 characters or less';
    }

    if (about.length < 50) {
      newErrors.about = 'About needs 50 or more characters';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!onlineStatus) {
      newErrors.onlineStatus = "Please select an option for Online Status";
    }

    if (!privacy) {
      newErrors.privacy = "Please select an option for Privacy";
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


    const groupData = {
      organizerId: userData.id,
      name: name,
      about: about,
      type: onlineStatus,
      private: privacy === 'private',
      city: city,
      state: state,
      previewImage: imageUrl,
    }

    console.log("this is groupData:", groupData)

    let newGroup;

    if (formType === "Update Group") {
      newGroup = await dispatch(updateExistingGroup({ ...group, ...groupData }))
    } else {
      newGroup = await dispatch(postNewGroup(groupData))
    }

    if (newGroup.id) {
      history.push(`/groups/${newGroup.id}`);
    } else {
      const { errors } = await newGroup.json();
      setErrors(errors);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      {formType === "Update Group" ? (
        <>
          <h1>Update your Group</h1>
          <h2>Lets Make some changes</h2>
        </>
      ) : (
        <>
          <h1>Become an Organizer</h1>
          <h2>We'll walk you through a few steps to build your local community</h2>
        </>
      )}


      <div className='location-instructions'>
        <h2>First, set your group's location.</h2>
        <h3>Meetup groups meet locally, in person and online. We'll connect you with people
          in your area, and more can join you online.</h3>
        <label>
          <input
            type="text"
            placeholder="City, STATE"
            value={`${city}, ${state}`}
            onChange={(e) => {
              const locationValue = e.target.value;
              const [inputCity, inputState] = locationValue.split(',').map((part) => part.trim());
              setCity(inputCity);
              setState(inputState);
            }}
          />
        </label>
        {errors.city && <div className="errors">{errors.city}</div>}
        {errors.state && <div className="errors">{errors.state}</div>}
      </div>

      <div className='name-instructions'>
        <h2>What will your group's name be?</h2>
        <h3>Choose a name that will give people a clear idea of what the group is about.
          Feel free to get creative! You can edit this later if you change your mind.</h3>
        <label>
          <input
            type="text"
            placeholder="What is your group name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {errors.name && <div className="errors">{errors.name}</div>}
      </div>

      <div className='about-instructions'>
        <h2>Now describe what your group will be about</h2>
        <h3>People will see this when we promote your group, but you'll be able to add to it later, too</h3>
        <ol>
          <li>What's the purpose of the group?</li>
          <li>Who should join?</li>
          <li>What will you do at your events?</li>
        </ol>
        <label>
          <textarea
            placeholder="Please write at least 30 characters"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </label>
        {errors.about && <div className="errors">{errors.about}</div>}
      </div>

      <div className='statuses-and-url'>
        <h2>Final Steps</h2>
        <h3>Is this an in person or online group?</h3>
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

        <h3>Is this group private or public</h3>
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

      {formType === "Update Group" ? (
        <button type="submit">Update Group</button>
      ) : (
        <button type="submit">Create Group</button>
      )}
    </form>
  );
};

export default GroupForm;
