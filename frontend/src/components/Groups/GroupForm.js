import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { postNewGroup, updateExistingGroup } from '../../store/group';

const GroupForm = ({ group, formType }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [location, setLocation] = useState(group?.location || '');
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [onlineStatus, setOnlineStatus] = useState(group?.onlineStatus || '');
  const [privacy, setPrivacy] = useState(group?.privacy || '');
  const [imageUrl, setImageUrl] = useState(group?.imageUrl || '');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 60) {
      newErrors.name = 'Name must be 60 characters or less';
    }

    if (description.length < 30) {
      newErrors.description = 'Description needs 30 or more characters';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
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

    group = { ...group, name, description, onlineStatus, privacy, imageUrl }

    let newGroup;

    if (formType === "Update Group") {
      newGroup = await dispatch(updateExistingGroup(group))
    } else {
      newGroup = await dispatch(postNewGroup(group))
    }

    if (newGroup.id) {
      history.push(`/reports/${newGroup.id}`);
    } else {
      const { errors } = await newGroup.json();
      setErrors(errors);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{formType}</h2>

      <label>
        Group Location:
        <input
          type="text"
          placeholder="City, STATE"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </label>
      {errors.location && <div className="errors">{errors.location}</div>}

      <label>
        Group Name:
        <input
          type="text"
          placeholder="What is your group name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      {errors.name && <div className="errors">{errors.name}</div>}
      <div className="errors">{errors.description}</div>

      <label>
        Description:
        <textarea
          placeholder="Please write at least 30 characters"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {errors.description && <div className="errors">{errors.description}</div>}

      <label>
        Online Status:
        <select
          value={onlineStatus}
          onChange={(e) => setOnlineStatus(e.target.value)}
        >
          <option value="" disabled>
            (Select One)
          </option>
          <option value="online">Online</option>
          <option value="inPerson">In Person</option>
        </select>
      </label>
      {errors.onlineStatus && <div className="errors">{errors.onlineStatus}</div>}

      <label>
        Privacy:
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

      <label>
        Image URL:
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
      {errors.imageUrl && <div className="errors">{errors.imageUrl}</div>}

      <button type="submit">Create Group</button>
    </form>
  );
};

export default GroupForm;
