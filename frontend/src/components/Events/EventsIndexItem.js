const EventIndexItem = ({event}) => {


  return(
    <section>
      <div className="event-contents-flex">
      <h1>{event.name}</h1>
      </div>
    </section>
  )
}

export default EventIndexItem;
