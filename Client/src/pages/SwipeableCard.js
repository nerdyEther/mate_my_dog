// SwipeableCard.js
import React, { useState } from 'react';

const SwipeableCard = ({ character, onSwipe, onOutOfFrame }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const x = event.clientX - window.innerWidth / 2;
    const y = event.clientY - window.innerHeight / 2;
    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    if (position.x > 150) {
      onSwipe('right', character.name);
    } else if (position.x < -150) {
      onSwipe('left', character.name);
    }
    onOutOfFrame(character.name);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="swipe-card"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s',
        backgroundImage: `url(${character.url})`,
      }}
    >
      <h3>{character.name}</h3>
    </div>
  );
};

export default SwipeableCard;
