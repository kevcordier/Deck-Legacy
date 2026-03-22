import type { ReactNode } from 'react'
import './CardRow.css'

interface CardRowProps {
  children: ReactNode
}

export function CardRow({ children }: CardRowProps) {
  return <div className="card-row">{children}</div>
}
