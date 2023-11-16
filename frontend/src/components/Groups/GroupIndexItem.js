const GroupIndexItem = ({ group }) => {
  let isPrivate = '';
  if (group.private) isPrivate = 'Private';
  if (!group.private) isPrivate = 'Public'

  return (
    <section>
      <div className="group-contents-flex">
        <img src = {group.previewImage} alt={`Preview of ${group.name}`}/>
        <h1>{group.name}</h1>
        <h3>{group.city},{group.state}</h3>
        <p>{group.about}</p>
        <p>{group.numEvents}</p>
        <p>{isPrivate}</p>
      </div>
    </section>
  )
}

export default GroupIndexItem;
