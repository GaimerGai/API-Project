import { Link } from "react-router-dom/cjs/react-router-dom.min";

const GroupIndexItem = ({ group }) => {
  let isPrivate = '';
  if (group.private) isPrivate = 'Private';
  if (!group.private) isPrivate = 'Public'

  return (
    <section>
      <div className="group-contents-flex">
      <Link to={`/groups/${group.id}`}
          style={{
            textDecoration: "none",
            display: "block",
            width: "100%",
            height: "100%"
          }}>
        <h1>{group.name}</h1>
        <h3>{group.city},{group.state}</h3>
        <p>{group.about}</p>
        <p>Events: {group.numEvents} {"\u00b7"} {isPrivate} </p>
        </Link>
      </div>
    </section>
  )
}

export default GroupIndexItem;
