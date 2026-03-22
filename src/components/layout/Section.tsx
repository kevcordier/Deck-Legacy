import type { ReactNode } from 'react'
import './Section.css'

interface SectionProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function Section({ title, subtitle, children }: SectionProps) {
  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && <span className="section-subtitle">{subtitle}</span>}
        <div className="section-divider" />
      </div>
      {children}
    </div>
  )
}
