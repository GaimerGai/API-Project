import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import * as groupActions from "./store/group"
import Navigation from "./components/Navigation";
import Groups from "./components/Groups";
import GroupDetail from "./components/Groups/GroupDetail";
import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OpenModalMenuItem from "./components/Navigation/OpenModalMenuItem";
import SignupFormModal from "./components/SignupFormModal";
import Events from "./components/Events";
import EventDetail from "./components/Events/EventDetail";


function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const session = useSelector((state) => state.session)
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,sed do eiusmod tempor incididunt ut labore et dolore magnaaliqua. Ut enim ad minim veniam, quis nostrud exercitationullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptat evelit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

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
        <div>
          <h1>The people Platform- Where interests become friendships</h1>
          <p>{loremIpsum}</p>
        </div>
        <div>
          <h2>How Meetup Works</h2>
          <p>{loremIpsum}</p>
        </div>
      <div className="middle-landing-page-nav">
        <div className="groups-landing-page-container">
          <Link to="/groups">See All Groups</Link>
          <p>{loremIpsum}</p>
        </div>
        <div className="events-landing-page-container">
          <Link to="/events">Find an Event</Link>
          <p>{loremIpsum}</p>
        </div>
        <div className="create-new-group-page-container">
          <Link to="/groups/new">Start a new Group</Link>
          <p>{loremIpsum}</p>
        </div>
        {!session.user && (
          <div className="meetup">
            <OpenModalMenuItem
              itemText="Join Meetup"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </div>
        )}
      </div>
      </>
      )}
      {isLoaded && (
        <Switch>
          <Route exact path="/" />
          <Route exact path="/groups" component={Groups} />
          <Route path="/groups/:groupId" component={GroupDetail} />
          <Route exact path="/events" component={Events} />
          <Route path="/events/:eventId" component={EventDetail} />
        </Switch>
      )}
    </>
  );
}

export default App;
