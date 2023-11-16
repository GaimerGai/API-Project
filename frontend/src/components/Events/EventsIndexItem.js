const EventIndexItem = ({event}) => {


  return(
    <section>
      <div className="event-contents-flex">
      <img src = {event.previewImage} alt={`Preview of ${event.name}`}/>
      <h3>{event.startDate}</h3>
      <h1>{event.name}</h1>
      <h3>{event.Group.city} * {event.Group.state}</h3>
      <p>{event.description}</p>
      </div>
    </section>
  )
}

export default EventIndexItem;
