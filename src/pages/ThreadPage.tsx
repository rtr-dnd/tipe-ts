import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import TipeList from '../components/TipeList'
import { selectLibrary } from '../redux/librarySlice'

// interface ThreadPageProps {
//   id: string
// }

function ThreadPage () {
  const library = useSelector(selectLibrary)
  const params = useParams()

  const threadId = library.threads.find(element => element.id === (params as any).threadId)?.id

  return (
    <div>
      <TipeList
        thread={threadId}
      />
    </div>
  )
}

export default ThreadPage
