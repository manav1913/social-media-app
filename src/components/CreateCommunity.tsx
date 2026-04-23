import React from 'react'

const CreateCommunity = () => {
 return (
  <div className="create-community">
    <form className="community-form">
      <h2>Create New Community</h2>

      <div className="form-group">
        <label>Community Name</label>
        <input type="text" id="name" required />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea id="description" required rows={3} />
      </div>

      <button className="submit-btn">Create Community</button>
    </form>
  </div>
)
}

export default CreateCommunity
