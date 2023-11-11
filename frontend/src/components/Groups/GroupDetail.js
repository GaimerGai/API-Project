import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById, fetchEventsByGroupId } from "../../store/group";
import { Link, useParams } from "react-router-dom";
import { loremIpsum } from "../../App";



function GroupDetail() {
  const { groupId } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupById(groupId))
    .then(() => dispatch(fetchEventsByGroupId(groupId)))
    .then(() => setIsLoaded(true));
  }, [dispatch, groupId]);

  const groupData = useSelector((state) => state.groups.currGroup);

  const eventData = useSelector((state) =>state.groups.Events)

  console.log("This is eventData:", eventData)

  let isPrivate = '';
  if (groupData.private) isPrivate = 'Private';
  if (!groupData.private) isPrivate = 'Public'

  const handleJoinGroup = () => {
    alert("Feature Coming Soon");
  };

  const now = new Date();
  const upcomingEvents = Object.values(eventData).filter((event) => new Date(event.startDate) > now);
  console.log("this is upcomingEvents:", upcomingEvents)
  const pastEvents = Object.values(eventData).filter((event) => new Date(event.startDate) <= now);
  console.log("this is pastEvents:", pastEvents)

  return (
    isLoaded && (
      <div className="web-page">
        <div className="backlink">
          <Link to="/groups">Groups</Link>
        </div>
        <div className="topCard">
          <h2>{groupData.name}</h2>
          <h3>
            {groupData.city}, {groupData.state}
          </h3>
          <p>Number of Events: {groupData.numEvents} * {isPrivate}</p>
          <p>
            Organized by: {groupData.Organizer.firstName} {groupData.Organizer.lastName}
          </p>
          <button onClick={handleJoinGroup}>Join this group</button>
        </div>
        <div className="middleCard">
          <h2>Organizer</h2>
          <p>{groupData.Organizer.firstName} {groupData.Organizer.lastName}</p>
          <h2>What We're about</h2>
          <p>{loremIpsum}</p>
        </div>
        <div className="eventsCard">
          <h2></h2>
        </div>
      </div>
    )
  );
}

export default GroupDetail;
