import PageTitle from '@/components/ui/page-title'
import React from 'react'
import DocForm from '../_components/doc-form'

function AddDocPage() {
  return (
    <div>
        <PageTitle title='Add Document' />
        <DocForm formType='add'
          initialValues={null}
         />
    </div>
  )
}

export default AddDocPage