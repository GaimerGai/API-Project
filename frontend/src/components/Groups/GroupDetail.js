import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";



function GroupDetail() {
  const { groupId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupById(groupId)).then(() => setIsLoaded(true));
  }, [dispatch, groupId]);

  const data = useSelector((state) => state.groups);
  console.log("This is data:",data)

  let isPrivate = '';
  if (data.private) isPrivate = 'Private';
  if (!data.private) isPrivate = 'Public'

  return (
    isLoaded && (
      <div className="web-page">
        <div className="backlink">
          <Link to="/groups">Groups</Link>
        </div>
        <div className="topcard">
          <h2>Group Details</h2>
          <h2>{data.name}</h2>
          <h3>
            {data.city}, {data.state}
          </h3>
          <p>Number of Events: {data.numEvents} * {isPrivate}</p>
          <p>
            Organized by: {data.Organizer.firstName} {data.Organizer.lastName}
          </p>
        </div>
        <div>
          
        </div>
      </div>
    )
  );
}

export default GroupDetail;
