import React from 'react'
import { useSelector } from 'react-redux'

import TipeList from '../components/TipeList'
import { selectLibrary } from '../redux/librarySlice'

function IndexPage () {
  const library = useSelector(selectLibrary)

  return (
    <div>
      <TipeList
        indexes={[...library.tipes.keys()]}
      />
    </div>
  )
}

export default IndexPage
