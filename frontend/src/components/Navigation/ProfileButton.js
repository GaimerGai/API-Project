import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import { Link} from "react-router-dom";
import "./Navigation.css"
import { useHistory } from "react-router-dom";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    history.push('/');
    closeMenu();
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
      <div className="profile-button-complete">
    <>
      <button className="navigation-button" onClick={openMenu}>
        <i className="fas fa-user-circle" />
      </button>
      {showMenu &&
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <li>Hello {user.firstName}</li>
            <li>{user.email}</li>
            <li>
              <button>
              <Link to="/groups">View Groups</Link>
              </button>
            </li>
            <li>
              <button>
              <Link to="/events">See All Events</Link>
              </button>
            </li>
            <li>
              <button>
              <Link to="/groups/new">Create A Group</Link>
              </button>
            </li>
            <li>
              <button onClick={logout}>Log Out</button>
            </li>
          </>
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </>
        )}
      </ul>
      }
    </>
      </div>
  );
}

export default ProfileButton;
