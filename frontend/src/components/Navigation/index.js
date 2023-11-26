import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import image from '../Navigation/logo.png';
import { Link } from "react-router-dom";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
      <div className="logo-container">
        <NavLink exact to='/'>
          <img src={image} alt="Your Logo" className="logo" />
        </NavLink>
        <div className='buttons-container'>
          {sessionUser && (
            <button className='navigation-button'>
              <Link to="/groups/new">Create A Group</Link>
            </button>
          )}
          {isLoaded && (
            <ProfileButton user={sessionUser} />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
