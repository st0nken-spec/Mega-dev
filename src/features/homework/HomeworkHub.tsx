import { useState } from 'react'
import type { TrackId } from '../../game'
import { TrackPicker } from '../../components/TrackPicker'
import { homeworkSubjects, type Stage } from './homeworkContent'
import { makeWorksheet } from './homeworkDomain'

const stageLabel:Record<Stage,string>={forskola:'Förskola',ak1:'Åk 1'}

export function HomeworkHub(){
  const [subjectId,setSubjectId]=useState<TrackId>('math')
  const [stage,setStage]=useState<Stage>('forskola')
  const [worksheet,setWorksheet]=useState(()=>makeWorksheet('math','forskola'))
  const [showAnswers,setShowAnswers]=useState(false)

  const regenerate=(nextSubject:TrackId=subjectId,nextStage:Stage=stage)=>{
    setSubjectId(nextSubject);setStage(nextStage);setWorksheet(makeWorksheet(nextSubject,nextStage));setShowAnswers(false)
  }

  return <section className="homework-hub">
    <TrackPicker items={homeworkSubjects} activeId={subjectId} onSelect={id=>regenerate(id,stage)}/>
    <section className="hero"><div><p className="eyebrow">{stageLabel[stage].toUpperCase()}</p><h2>Läxa</h2><div className="stage-toggle"><button aria-pressed={stage==='forskola'} className={stage==='forskola'?'active':''} onClick={()=>regenerate(subjectId,'forskola')}>Förskola</button><button aria-pressed={stage==='ak1'} className={stage==='ak1'?'active':''} onClick={()=>regenerate(subjectId,'ak1')}>Åk 1</button></div></div><div className="actions"><button aria-pressed={showAnswers} className="level" onClick={()=>setShowAnswers(value=>!value)}>{showAnswers?'Dölj facit':'Visa facit'}</button><button className="reset" onClick={()=>regenerate()}>Nytt blad</button></div></section>
    <section className="worksheet" aria-label="Övningsblad">{worksheet.map((item,i)=><div className="worksheet-item" data-testid={`worksheet-item-${i}`} key={item.id}><span className="worksheet-number">{i+1}.</span><span className="worksheet-prompt">{item.prompt}</span><span className="worksheet-answer">{showAnswers?item.answer:'____'}</span></div>)}</section>
    <button className="print-button no-print" onClick={()=>window.print()}>Skriv ut</button>
  </section>
}
