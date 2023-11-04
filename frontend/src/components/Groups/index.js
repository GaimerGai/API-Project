import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { fetchGroups } from "../../store/group";


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
          <li key={group.id}>
            <div>
              <h3>{group.name}</h3>
              <p>{group.about}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
