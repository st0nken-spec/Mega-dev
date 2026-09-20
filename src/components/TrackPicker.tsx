import type { TrackId } from '../game'

type TrackPickerItem = { id: TrackId; name: string; shortName: string }

export function TrackPicker({items,activeId,onSelect}:{
  items: readonly TrackPickerItem[]
  activeId: TrackId
  onSelect: (id: TrackId) => void
}){
  return <section className="track-picker" aria-label="Välj ämne">{items.map(item=><button aria-pressed={item.id===activeId} className={item.id===activeId?'track active':'track'} onClick={()=>onSelect(item.id)} key={item.id}><span>{item.shortName}</span><b>{item.name}</b></button>)}</section>
}
