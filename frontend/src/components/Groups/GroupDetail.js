import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupById } from "../../store/group";
import { Link, useParams } from "react-router-dom";



function GroupDetail() {
  const { groupId } = useParams();
  console.log("groupID:", groupId)
  const data = useSelector((state) => state.groups);
  const groups = Object.values(data)
  const selectedGroup = groups[groupId - 1];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupById(groupId));
    console.log("successful dispatch")
  }, [dispatch, groupId]);

  let isPrivate = '';
  if (selectedGroup.private) isPrivate = 'Private';
  if (!selectedGroup.private) isPrivate = 'Public'


  return (
    <div>
      <h2>Group Details</h2>
      <h2>{selectedGroup.name}</h2>
      <h3>{selectedGroup.city},{selectedGroup.state}</h3>
      <p>{selectedGroup.numEvents}</p>
      <p>{isPrivate}</p>
      <h2></h2>

    </div>
  );
}

export default GroupDetail;
