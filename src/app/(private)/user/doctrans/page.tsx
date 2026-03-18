import React from 'react'
import PageTitle from '../../../../components/ui/page-title'
import {Button} from "@/components/ui/button";
import Link from 'next/link';


function DocumentTransPage() {
  return (
    <div>
      <div className='flex justify-between items-center'>
        <PageTitle title='Document Translation' />
        <Button>
            <Link href='/user/doctrans/add'>
                Add Document
            </Link>
        </Button>
      </div>
    </div>
  )
}

export default DocumentTransPage