import React from 'react'
import './LikeButton.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase-client'

interface Props {
  postId: number
}

interface VoteData {
  count: number
  liked: boolean
}

const getLikeData = async (postId: number): Promise<VoteData> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw new Error(userError.message)

  const { count, error: countError } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('vote', 1)

  if (countError) throw new Error(countError.message)

  if (!user) {
    return {
      count: count || 0,
      liked: false,
    }
  }

  const { data: existingVote, error: voteError } = await supabase
    .from('votes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('vote', 1)
    .maybeSingle()

  if (voteError) throw new Error(voteError.message)

  return {
    count: count || 0,
    liked: !!existingVote,
  }
}

const toggleLike = async ({
  postId,
  liked,
}: {
  postId: number
  liked: boolean
}) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw new Error(userError.message)
  if (!user) throw new Error('Please sign in first')

  if (liked) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('vote', 1)

    if (error) throw new Error(error.message)

    return { liked: false }
  }

  const { error } = await supabase.from('votes').insert({
    post_id: postId,
    user_id: user.id,
    vote: 1,
  })

  if (error) throw new Error(error.message)

  return { liked: true }
}

const LikeButton = ({ postId }: Props) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['votes', postId],
    queryFn: () => getLikeData(postId),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: toggleLike,
    onMutate: async ({ liked }) => {
      await queryClient.cancelQueries({ queryKey: ['votes', postId] })

      const previousData = queryClient.getQueryData<VoteData>(['votes', postId])

      queryClient.setQueryData<VoteData>(['votes', postId], (old) => {
        if (!old) {
          return {
            count: liked ? 0 : 1,
            liked: !liked,
          }
        }

        return {
          count: liked ? old.count - 1 : old.count + 1,
          liked: !liked,
        }
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['votes', postId], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', postId] })
    },
  })

  const handleClick = () => {
    if (!data) return
    mutate({ postId, liked: data.liked })
  }

  if (isLoading) {
    return <button className="like-btn">♡ <span className="like-count">0</span></button>
  }

  return (
    <button
      type="button"
      className={`like-btn ${data?.liked ? 'liked' : ''}`}
      onClick={handleClick}
      aria-label={data?.liked ? 'Unlike post' : 'Like post'}
      disabled={isPending}
    >
      <span className="heart">{data?.liked ? '❤' : '♡'}</span>
      <span className="like-count">{data?.count ?? 0}</span>
    </button>
  )
}

export default LikeButton