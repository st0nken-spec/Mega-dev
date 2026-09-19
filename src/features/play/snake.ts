import type { Difficulty } from '../../game'
export type Point={x:number;y:number}
export type Direction='up'|'down'|'left'|'right'
export type SnakeState={snake:Point[];direction:Direction;food:Point;score:number;over:boolean;target:number}
const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'}
export const samePoint=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y
export const nextTarget=(score:number,difficulty:Difficulty=1)=>difficulty===1?score%5+1:score%9+1
export const createSnake=(food:Point={x:4,y:2},difficulty:Difficulty=1):SnakeState=>({snake:[{x:2,y:2},{x:1,y:2}],direction:'right',food,score:0,over:false,target:difficulty===1?1:6})
export const turnSnake=(state:SnakeState,direction:Direction):SnakeState=>state.over||opposite[state.direction]===direction?state:{...state,direction}
export const placeFood=(snake:Point[],random:()=>number=Math.random,size=6):Point=>{const free:Array<Point>=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});return free[Math.min(free.length-1,Math.floor(random()*free.length))]??{x:0,y:0}}
export const stepSnake=(state:SnakeState,random:()=>number=Math.random,size=6,difficulty:Difficulty=1):SnakeState=>{
  if(state.over)return state
  const head=state.snake[0];const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=delta[state.direction];const next={x:head.x+d.x,y:head.y+d.y};const ate=samePoint(next,state.food);const body=ate?state.snake:state.snake.slice(0,-1)
  if(next.x<0||next.y<0||next.x>=size||next.y>=size||body.some(p=>samePoint(p,next)))return{...state,over:true}
  const snake=[next,...body];const score=state.score+(ate?1:0);return{...state,snake,score,target:ate?nextTarget(score,difficulty):state.target,food:ate?placeFood(snake,random,size):state.food}
}
