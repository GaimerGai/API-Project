import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";



function GroupDetail() {
  const { groupId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupById(groupId));
    console.log("successful dispatch")
  }, [dispatch, groupId]);

  const data = useSelector((state) => state.groups);
  const groups = Object.values(data)
  const selectedGroup = groups[groupId -1];

  console.log("this is selectedGroup: ",selectedGroup)


  let isPrivate = '';
  if (selectedGroup.private) isPrivate = 'Private';
  if (!selectedGroup.private) isPrivate = 'Public'


  return (
    <div>
      <h2>Group Details</h2>
      <h2>{selectedGroup.name}</h2>
      <h3>{selectedGroup.city},{selectedGroup.state}</h3>
      <p>Number of Events: {selectedGroup.numEvents} * {isPrivate}</p>
      <p>Organized by: </p>
      <h2></h2>

    </div>
  );
}

export default GroupDetail;
