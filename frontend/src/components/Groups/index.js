import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { fetchGroups } from "../../store/group";
import GroupIndexItem from "./GroupIndexItem";
import { Link } from "react-router-dom";


function Groups() {
  const groups = useSelector((state) => state.groups);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroups()).then(() => setIsLoaded(true))
  }, [dispatch]);

  return (
    <div>
      <h2>Groups</h2>
      <ul>
        {Object.values(groups).map((group) => (
            <Link to={`/groups/${group.id}`}>{<GroupIndexItem
              group={group}
              key={group.id}
            />}</Link>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
