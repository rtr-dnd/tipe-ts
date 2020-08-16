import React from 'react'
import TipeList from '../components/TipeList'

function ThreadPage () {
  return (
    <div>
      This is thread
      <TipeList
        indexes={[0, 2]}
      />
    </div>
  )
}

export default ThreadPage
