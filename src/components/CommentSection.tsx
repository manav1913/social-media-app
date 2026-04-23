import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../supabase-client'
import './CommentSection.css'

interface Props {
  postId: number
}

interface NewComment {
  content: string
  parent_comment_id?: number | null
}

const createComment = async (
  newComment: NewComment,
  postId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error('You must be logged in to comment')
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id ?? null,
    user_id: userId,
    author,
  })

  if (error) throw new Error(error.message)
}

const CommentSection = ({ postId }: Props) => {
  const [newCommentText, setNewCommentText] = useState('')
  const { user } = useAuth()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (newComment: NewComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata?.user_name || user?.email
      ),
    onSuccess: () => {
      setNewCommentText('')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedComment = newCommentText.trim()
    if (!trimmedComment) return

    mutate({
      content: trimmedComment,
      parent_comment_id: null,
    })
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title">Comments</h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-textarea"
            value={newCommentText}
            rows={3}
            placeholder="Write a comment..."
            onChange={(e) => setNewCommentText(e.target.value)}
          />

          <button
            className="comment-submit-btn"
            type="submit"
            disabled={!newCommentText.trim() || isPending}
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>

          {isError && (
            <p className="comment-error">
              {error instanceof Error ? error.message : 'Error posting comment.'}
            </p>
          )}
        </form>
      ) : (
        <p className="comment-login-text">
          You must be logged in to post a comment.
        </p>
      )}
    </div>
  )
}

export default CommentSection