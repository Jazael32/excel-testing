'use client'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { useCreateAtom } from '@tanstack/react-store'
import { tableDevtoolsPlugin } from '@tanstack/react-table-devtools'

export default function TableProvider({ children }: { children: React.ReactNode }) {

  return (
    <>
      {children}

      <TanStackDevtools
        plugins={[tableDevtoolsPlugin()]}
      />
    </>
  )
}