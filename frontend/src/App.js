import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Groups from "./components/Groups";
import GroupDetail from "./components/Groups/GroupDetail";
import CreateGroupForm from "./components/Groups/CreateGroupForm";
import EditGroupForm from "./components/Groups/EditGroupForm";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OpenModalMenuItem from "./components/Navigation/OpenModalMenuItem";
import SignupFormModal from "./components/SignupFormModal";
import Events from "./components/Events";
import EventDetail from "./components/Events/EventDetail";
import CreateEventForm from "./components/Events/CreateEventForm";
import EditEventForm from "./components/Events/EditEventForm";
import "./index.css";
import image from '../src/Meetup.png';

export const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,sed do eiusmod tempor incididunt ut labore et dolore magnaaliqua. Ut enim ad minim veniam, quis nostrud exercitationullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptat evelit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const session = useSelector((state) => state.session)
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();


  const closeMenu = (e) => {
    if (!ulRef.current?.contains(e.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  const isOnLandingPage = location.pathname === "/";


  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isOnLandingPage && (
        <>
          <div className="app-container">
            <div className="top-section">
              <div className="text-section">
                <h1>The people Platform- Where interests become friendships</h1>
                <p>{loremIpsum}</p>
              </div>
              <div className="image-section">
                <img src={image} alt="Meetup" />
              </div>
            </div>
            <div className="middle-section">
              <h2>How Meetup Works</h2>
              <p>{loremIpsum}</p>
            </div>
            <div className="bottom-section">
              <div className="section">
                <Link to="/groups" className='teal-link'>See All Groups</Link>
                <p>{loremIpsum}</p>
              </div>
              <div className="section">
                <Link to="/events" className='teal-link'>Find an Event</Link>
                <p>{loremIpsum}</p>
                {!session.user && (
                  <div className="join-meetup-button">
                    <OpenModalMenuItem
                      itemText="Join Meetup"
                      onItemClick={closeMenu}
                      modalComponent={<SignupFormModal />}
                    />
                  </div>
                )}
              </div>
              <div className="section">
                <Link
                to="/groups/new"
                className={session.user ? "teal-link" : "disabled-link"}
                style={session.user ? {} : { color: 'lightgrey', cursor: 'default', pointerEvents: 'none' }}
                 >Start a new Group</Link>
                <p>{loremIpsum}</p>
              </div>
            </div>
          </div>
        </>
      )}
      {isLoaded && (
        <Switch>
          <Route exact path="/" />
          <Route exact path="/groups" component={Groups} />
          <Route exact path="/groups/new" component={CreateGroupForm} />
          <Route exact path="/groups/:groupId/events/new" component={CreateEventForm} />
          <Route path="/groups/:groupId/edit" component={EditGroupForm} />
          <Route path="/events/:eventId/edit" component={EditEventForm} />
          <Route exact path="/events" component={Events} />
          <Route path="/groups/:groupId" component={GroupDetail} />
          <Route path="/events/:eventId" component={EventDetail} />
        </Switch>
      )}
    </>
  );
}

export default App;
