import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { fetchGroups } from "../../store/group";
import GroupIndexItem from "./GroupIndexItem";
import { Link } from "react-router-dom";
import '../Groups/Groups.css';

function Groups() {
  const groups = useSelector((state) => state.groups.groups);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroups()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <div className="container-wrapper">
      <div className="header-links">
        <h2>
          <Link to="/events" className="event-link-on-group-page">
            Events
          </Link>
        </h2>
        <h2>
          <Link to="/groups" className="group-link-on-group-page">
            Groups
          </Link>
        </h2>
      </div>
      <div className="group-container">
        <h3>Groups in Meetup</h3>
        <ul className="group-list">
          {Object.values(groups).map((group) => (
            <li key={group.id} className="group-list-item">
              <Link to={`/groups/${group.id}`}>
                <img src={group.imageSrc} alt={group.name} />
              </Link>
              <div className="text-content">
                <GroupIndexItem group={group} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groups;
