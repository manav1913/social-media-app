import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { supabase } from '../supabase-client'
import './CreateCommunity.css'
import { useNavigate } from 'react-router'

interface CommunityInput {
  name: string
  description: string
}

const createCommunity = async ({ name, description }: CommunityInput) => {
  const { error } = await supabase.from('communities').insert({
    name,
    description,
  })

  if (error) throw new Error(error.message)
}

const CreateCommunity = () => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createCommunity,
    onSuccess: async () => {
      setName('')
      setDescription('')
      await queryClient.invalidateQueries({ queryKey: ['communities'] })
      navigate('/communities')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim() || !description.trim()) return

    mutate({
      name: name.trim(),
      description: description.trim(),
    })
  }

  return (
    <div className="create-community">
      <form className="community-form" onSubmit={handleSubmit}>
        <h2>Create New Community</h2>

        <div className="form-group">
          <label htmlFor="name">Community Name</label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className="submit-btn"
          type="submit"
          disabled={!name.trim() || !description.trim() || isPending}
        >
          {isPending ? 'Creating...' : 'Create Community'}
        </button>

        {isError && (
          <p className="form-error">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        )}
      </form>
    </div>
  )
}

export default CreateCommunity