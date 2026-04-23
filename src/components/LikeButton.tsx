import React, { useState } from 'react'
import './LikeButton.css'

interface Props {
  postId: number
}

const LikeButton = ({ postId }: Props) => {
  const [liked, setLiked] = useState(false)

  return (
    <button
      type="button"
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={() => setLiked(!liked)}
      aria-label={liked ? 'Unlike post' : 'Like post'}
    >
      <span className="heart">{liked ? '❤' : '♡'}</span>
    </button>
  )
}

export default LikeButton