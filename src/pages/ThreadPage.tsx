import React from 'react'
import { useSelector } from 'react-redux'

import TipeList from '../components/TipeList'
import { selectLibrary } from '../redux/librarySlice'

function ThreadPage () {
  const library = useSelector(selectLibrary)

  return (
    <div>
      <TipeList
        indexes={[0]}
        thread={true}
      />
    </div>
  )
}

export default ThreadPage
