import type { ReactNode } from 'react'

export function ActivityFrame({backLabel,onBack,breadcrumb,children}:{
  backLabel: string
  onBack: () => void
  breadcrumb: string
  children: ReactNode
}){
  return <section className="activity-frame">
    <div className="activity-frame-crumb">
      <button className="back-link" onClick={onBack}>← {backLabel}</button>
      <span className="crumb-sep">/</span>
      <span className="crumb-current">{breadcrumb}</span>
    </div>
    {children}
  </section>
}
