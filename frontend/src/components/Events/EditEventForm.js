import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventById } from "../../store/event";
import { useEffect } from "react";
import EventForm from "./EventForm";

const EditEventForm = () => {
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const event = useSelector((state) => state.events.currEvent); // populate from Redux store

    useEffect(() => {
        dispatch(fetchEventById(eventId));
    }, [dispatch, eventId]);

    if (!event) return <></>;

    /* **DO NOT CHANGE THE RETURN VALUE** */
    return (
        Object.keys(event).length > 1 && (
            <>
                <EventForm event={event} formType="Update Event" />
            </>
        )
    );
};

export default EditEventForm;
