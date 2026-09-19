import { useState } from 'react'
import { coloringPages, nextRegionColor, palette } from './createDomain'

export function ColoringStudio(){
  const [pageId,setPageId]=useState(coloringPages[0].id)
  const [color,setColor]=useState<string>(palette[0])
  const [fills,setFills]=useState<Record<string,string>>({})
  const page=coloringPages.find(item=>item.id===pageId) ?? coloringPages[0]
  const choosePage=(id:string)=>{setPageId(id);setFills({})}
  return <section className="create-studio" aria-label="Målarbilder">
    <div className="template-row" aria-label="Välj målarbild">{coloringPages.map(item=><button className={item.id===pageId?'template active':'template'} key={item.id} onClick={()=>choosePage(item.id)} aria-pressed={item.id===pageId}><span>{item.emoji}</span>{item.name}</button>)}</div>
    <div className="palette" aria-label="Välj färg">{palette.map(item=><button key={item} className={item===color?'swatch active':'swatch'} style={{backgroundColor:item}} onClick={()=>setColor(item)} aria-label={`Färg ${item}`} aria-pressed={item===color}/>)}</div>
    <svg className="coloring-page" viewBox="0 0 200 200" role="img" aria-label={`Målarbild: ${page.name}`}>{page.regions.map(region=><path key={region.id} data-testid={`region-${region.id}`} d={region.path} fill={fills[region.id] ?? '#fff'} onClick={()=>setFills(items=>({...items,[region.id]:nextRegionColor(items[region.id],color)}))}/>)}</svg>
    <button className="create-action secondary" onClick={()=>setFills({})}>Sudda allt</button>
  </section>
}
