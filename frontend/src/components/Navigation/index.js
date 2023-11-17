import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import image from '../Navigation/logo.png';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
      <div className="logo-container">
        <NavLink exact to='/'>
        <img src={image} alt="Your Logo" className="logo" />
        </NavLink>
        {isLoaded && (
          <ProfileButton user={sessionUser} />
        )}
      </div>
    </nav>
  );
}

export default Navigation;
