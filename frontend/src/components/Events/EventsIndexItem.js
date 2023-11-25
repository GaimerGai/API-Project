import { Link } from "react-router-dom/cjs/react-router-dom.min";

const EventIndexItem = ({ event }) => {

  console.log("This is event: ", event)

  return (
    <section>
      <div className="event-contents-flex">
        <Link to={`/events/${event.id}`}
          style={{
            textDecoration: "none",
            display: "block",
            width: "100%",
            height: "100%"
          }}>
          <h3>{new Date(event.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).replace(" ", "\u00b7").replace(',', '')}</h3>
          <h1>{event.name}</h1>
          <h3>{event.Group.city},{event.Group.state}</h3>
          <p>{event.description}</p>
        </Link>
      </div>
    </section>
  )
}

export default EventIndexItem;
