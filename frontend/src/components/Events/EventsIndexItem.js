const EventIndexItem = ({event}) => {

  console.log("This is event: ", event)

  return(
    <section>
      <div className="event-contents-flex">
      <img src = {event.previewImage} alt={`Preview of ${event.name}`}/>
      <h3>{new Date(event.startDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
      }).replace(" ", " * ").replace(',','')}</h3>
      <h1>{event.name}</h1>
      <h3>{event.Group.city} * {event.Group.state}</h3>
      <p>{event.description}</p>
      </div>
    </section>
  )
}

export default EventIndexItem;
