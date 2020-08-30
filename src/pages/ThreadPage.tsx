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
  console.log(params)

  const index = library.threads.findIndex(element => element.id === (params as any).threadId)
  console.log(index)

  return (
    <div>
      <TipeList
        indexes={library.threads[index].children.map((e) => {
          return library.tipes.findIndex(t => t.id === e)
        })}
        thread={true}
      />
    </div>
  )
}

export default ThreadPage
