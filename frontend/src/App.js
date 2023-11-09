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
import EventDetail from "./components/Groups/GroupDetail";


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
        <div className="bottom-landing-page-nav">
          <Link to='/groups'>See All Groups</Link>
          <Link to='/events'>Find an Event</Link>
          <Link to='/groups/new'>Start a new Group</Link>
          {!session.user && (
            <div>
              <OpenModalMenuItem
                itemText="Join Meetup"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
                />
            </div>
          )}
        </div>
      )
      }
      {isLoaded &&
        <Switch>
          <Route exact path="/" />
          <Route exact path="/groups" component={Groups} />
          <Route path="/groups/:groupId" component={GroupDetail} />
          <Route exact path="/events" component={Events} />
          <Route path="/events/:eventId" component={EventDetail} />
        </Switch>}
    </>
  );
}

export default App;
