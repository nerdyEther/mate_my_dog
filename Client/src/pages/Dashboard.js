import TinderCard from 'react-tinder-card';
import { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [cookies] = useCookies(['user']);
  const [lastDirection, setLastDirection] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = cookies.UserId;

  const getUser = async () => {
    try {
      const response = await axios.get('https://matemydog-production.up.railway.app/user', {
        params: { userId },
      });
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError('Failed to fetch user data');
      setLoading(false);
    }
  };

  const getNearbyUsers = async () => {
    try {
      const response = await axios.get(`https://matemydog-production.up.railway.app/getloc-users`, {
        params: { userId },
      });
      setNearbyUsers(response.data);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      setError('Failed to fetch nearby users');
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
    getNearbyUsers();
  }, [userId]);

  const swiped = (direction, swipedUserId) => {
    if (direction === 'right') {
      updateMatches(swipedUserId);
    }
    setLastDirection(direction);
  };

  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put('https://matemydog-production.up.railway.app/addmatch', {
        userId,
        matchedUserId
      });
      getUser();
    } catch (err) {
      console.log(err);
      setError('Failed to update matches');
    }
  };

  const calculateCompatibilityScore = (currentUser, nearbyUser, index) => {
    // Early return if either user is null or missing required properties
    if (!currentUser || !nearbyUser || !currentUser.breed || !nearbyUser.breed || 
        !currentUser.age || !nearbyUser.age) {
      return 0;
    }

    let score = 0;

    // Breed Match
    if (currentUser.breed === nearbyUser.breed) {
      score += 50;
    }

    // Age Gap Calculation
    const ageGap = Math.abs(currentUser.age - nearbyUser.age);
    if (ageGap <= 2) {
      score += 20;
    } else {
      score -= (ageGap / 2) * 5;
    }

    // Distance Scoring
    const maxDistanceScore = 25;
    score += maxDistanceScore - index;

    return Math.max(0, Math.round(score)); // Ensure score is never negative
  };

  const matchedUserIds = user?.matches?.map(({ user_id }) => user_id).concat(userId) || [userId];
  const filteredNearbyUsers = nearbyUsers?.filter(nearbyUser => !matchedUserIds.includes(nearbyUser.user_id)) || [];

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!');
  };

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      ) : (
        <div className="dashboard">
          <div className="chat-container">
            <ChatContainer user={user} />
          </div>

          <div className="swipe-container">
            <div className="card-container">
              {filteredNearbyUsers.length > 0 ? (
                filteredNearbyUsers.slice().reverse().map((nearbyUser, index) => {
                  const compatibilityScore = user ? 
                    calculateCompatibilityScore(user, nearbyUser, index) : 0;

                  return (
                    <TinderCard
                      className="swipe"
                      key={nearbyUser.user_id}
                      onSwipe={(dir) => swiped(dir, nearbyUser.user_id)}
                      onCardLeftScreen={() => outOfFrame(nearbyUser.first_name)}
                    >
                      <div style={{ backgroundImage: `url(${nearbyUser.url})` }} className="card">
                        <div className="card-details">
                          <p>Name: {nearbyUser.first_name} {nearbyUser.last_name}</p>
                          <p>Compatibility Score: {compatibilityScore}</p>
                          <p>Age: {nearbyUser.age}</p>
                          <p>Breed: {nearbyUser.breed}</p>
                          <p>About: {nearbyUser.about}</p>
                          <p>Distance: {nearbyUser.distance?.toFixed(2) ?? 'N/A'} km</p>
                        </div>
                      </div>
                    </TinderCard>
                  );
                })
              ) : (
                <p>No nearby users found</p>
              )}
            </div>
            <div className="swipe-info">
              {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;