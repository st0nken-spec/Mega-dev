import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { palette, traceGuides } from './createDomain'

type Point={x:number;y:number}
function canvasPoint(canvas:HTMLCanvasElement,event:ReactPointerEvent<HTMLCanvasElement>):Point{const box=canvas.getBoundingClientRect();return{x:event.clientX-box.left,y:event.clientY-box.top}}
function setupCanvas(canvas:HTMLCanvasElement){const context=canvas.getContext('2d');if(!context)return;const ratio=Math.max(1,window.devicePixelRatio || 1);const width=canvas.clientWidth;const height=canvas.clientHeight;if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.scale(ratio,ratio);context.lineCap='round';context.lineJoin='round'}}

export function DrawingStudio({trace=false}:{trace?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);const drawing=useRef(false);const previous=useRef<Point|null>(null)
 const [color,setColor]=useState<string>(palette[0]);const [size,setSize]=useState(10);const [eraser,setEraser]=useState(false);const [guide,setGuide]=useState(traceGuides[0])
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;setupCanvas(canvas);const resize=()=>setupCanvas(canvas);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[])
 const begin=(event:ReactPointerEvent<HTMLCanvasElement>)=>{event.currentTarget.setPointerCapture(event.pointerId);drawing.current=true;previous.current=canvasPoint(event.currentTarget,event)}
 const move=(event:ReactPointerEvent<HTMLCanvasElement>)=>{if(!drawing.current||!previous.current)return;const canvas=event.currentTarget;const context=canvas.getContext('2d');if(!context)return;const point=canvasPoint(canvas,event);context.strokeStyle=eraser?'#fff':color;context.lineWidth=size;context.beginPath();context.moveTo(previous.current.x,previous.current.y);context.lineTo(point.x,point.y);context.stroke();previous.current=point}
 const end=()=>{drawing.current=false;previous.current=null}
 const clear=()=>{const canvas=canvasRef.current;canvas?.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height)}
 const save=()=>{const canvas=canvasRef.current;if(!canvas)return;const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const context=out.getContext('2d');if(!context)return;context.fillStyle='#fff';context.fillRect(0,0,out.width,out.height);if(trace){context.fillStyle='#d6dfdc';context.textAlign='center';context.textBaseline='middle';context.font=`700 ${Math.round(out.height*.7)}px ui-rounded, sans-serif`;context.fillText(guide.symbol,out.width/2,out.height/2)}context.drawImage(canvas,0,0);const link=document.createElement('a');link.download=`mega-dev-${trace?'spåra':'teckning'}.png`;link.href=out.toDataURL('image/png');link.click()}
 return <section className="create-studio" aria-label={trace?'Spåra konturer':'Rita fritt'}>
  {trace&&<div className="template-row" aria-label="Välj kontur">{traceGuides.map(item=><button className={item.id===guide.id?'template active':'template'} key={item.id} onClick={()=>{setGuide(item);clear()}} aria-pressed={item.id===guide.id}><span>{item.symbol}</span>{item.name}</button>)}</div>}
  <div className="draw-tools"><div className="palette" aria-label="Välj pennfärg">{palette.map(item=><button key={item} className={!eraser&&item===color?'swatch active':'swatch'} style={{backgroundColor:item}} onClick={()=>{setColor(item);setEraser(false)}} aria-label={`Pennfärg ${item}`}/>)}</div><label>Pennstorlek <input aria-label="Pennstorlek" type="range" min="4" max="28" value={size} onChange={event=>setSize(Number(event.target.value))}/></label><button className={eraser?'tool active':'tool'} onClick={()=>setEraser(value=>!value)}>Suddgummi</button></div>
  <div className="canvas-wrap">{trace&&<span className="trace-guide" aria-hidden="true">{guide.symbol}</span>}<canvas ref={canvasRef} className="drawing-canvas" aria-label={trace?`Rityta: spåra ${guide.name}`:'Rityta för fri teckning'} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/></div>
  <div className="create-actions"><button className="create-action secondary" onClick={clear}>Sudda allt</button><button className="create-action" onClick={save}>Spara bild</button></div>
 </section>
}
