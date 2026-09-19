export type HubPickerItem = { id: string; icon: string; name: string; description: string }

export function HubPicker({title,subtitle,items,onSelect,onBack}:{
  title: string
  subtitle: string
  items: HubPickerItem[]
  onSelect: (id: string) => void
  onBack: () => void
}){
  return <section className="hub-picker">
    <button className="back-link" onClick={onBack}>← Hem</button>
    <div><p className="eyebrow">{subtitle}</p><h2>{title}</h2></div>
    {items.map(item=><button className="hub-picker-item" onClick={()=>onSelect(item.id)} key={item.id}>
      <span className="hub-picker-icon">{item.icon}</span>
      <div><b>{item.name}</b><small>{item.description}</small></div>
      <span className="hub-picker-chevron">›</span>
    </button>)}
  </section>
}
