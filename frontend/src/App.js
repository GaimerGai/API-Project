import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import * as groupActions from "./store/group"
import Navigation from "./components/Navigation";
import Groups from "./components/Groups";
import GroupDetail from "./components/Groups/GroupDetail";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);
  

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded &&
      <Switch>
        <Route exact path = "/"/>
        <Route exact path = "/groups" component ={Groups}/>
        <Route path="/groups/:groupId" component={GroupDetail} />
      </Switch>}
    </>
  );
}

export default App;
