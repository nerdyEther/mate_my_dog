import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchesDisplay = ({ matches, setClickedUser }) => {
    const [matchedProfiles, setMatchedProfiles] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getMatches = async () => {
            setLoading(true);
            try {
                const matchedUserIds = matches.map(({ user_id }) => user_id);
                const response = await axios.get("http://localhost:8000/users", {
                    params: { userIds: JSON.stringify(matchedUserIds) }
                });
                
                // Filter matches to ensure both users have matched with each other
                const filteredMatches = response.data.filter(profile => 
                    profile.matches.some(match => 
                        matches.some(m => m.user_id === match.user_id)
                    )
                );
                
                setMatchedProfiles(filteredMatches);
            } catch (error) {
                console.error("Error fetching matches:", error);
            } finally {
                setLoading(false);
            }
        };

        if (matches.length > 0) {
            getMatches();
        } else {
            setMatchedProfiles([]);
            setLoading(false);
        }
    }, [matches]);

    if (loading) {
        return <div className="loading-spinner">Loading matches...</div>;
    }

    if (!matchedProfiles?.length) {
        return <div className="no-matches">No matches yet</div>;
    }

    return (
        <div className="matches-display">
            {matchedProfiles.map((match, index) => (
                <div
                    key={match.user_id || index}
                    className="match-card"
                    onClick={() => setClickedUser(match)}
                >
                    <div className="img-container">
                        <img 
                            src={match.url} 
                            alt={`${match.first_name}'s profile`}
                            onError={(e) => {
                                e.target.src = '/placeholder-profile.png';
                            }}
                        />
                    </div>
                    <h3>{match.first_name}</h3>
                </div>
            ))}
        </div>
    );
};

export default MatchesDisplay;