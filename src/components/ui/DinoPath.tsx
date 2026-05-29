'use client'

import React from 'react'

interface DinoPathProps {
  children: React.ReactNode
}

interface DinoRowProps {
  children: React.ReactNode
  count: 1 | 2 | 3
}

function DinoRow({ children, count }: DinoRowProps) {
  const justifyMap = {
    1: 'justify-center',
    2: 'justify-center gap-16',
    3: 'justify-center gap-8',
  }

  return (
    <div className={`flex items-center ${justifyMap[count]} w-full`}>
      {children}
    </div>
  )
}

export function DinoPath({ children }: DinoPathProps) {
  const rowPattern = [1, 2, 2, 3, 2]

  const childArray = React.Children.toArray(children)

  const rows: React.ReactNode[][] = []
  let childIndex = 0

  for (const count of rowPattern) {
    const row: React.ReactNode[] = []
    for (let i = 0; i < count; i++) {
      if (childIndex < childArray.length) {
        row.push(childArray[childIndex])
        childIndex++
      }
    }
    if (row.length > 0) {
      rows.push(row)
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-white py-8 overflow-y-auto">
      <div className="flex flex-col gap-12 px-4">
        {rows.map((row, rowIndex) => (
          <DinoRow key={rowIndex} count={row.length as 1 | 2 | 3}>
            {row}
          </DinoRow>
        ))}
      </div>
    </div>
  )
}