export type Lane=0|1|2
export type Action='run'|'jump'|'duck'
export type ObstacleKind='jump'|'duck'|'question'
export type Obstacle={id:string;lane:Lane;distance:number;kind:ObstacleKind;answer?:string}
export type RunState={lane:Lane;action:Action;distance:number;obstacles:Obstacle[];tokens:number;status:'running'|'crashed'|'clear'}
export const TICK_MS=300
export const LANE_COUNT=3
export const createRun=(obstacles:Obstacle[]=[]):RunState=>({lane:1,action:'run',distance:0,obstacles,tokens:0,status:'running'})
export const spawnObstacle=(distance:number,random:()=>number=Math.random):Obstacle=>{const kinds:ObstacleKind[]=['jump','duck','question'];return{id:`obstacle-${distance}`,lane:Math.min(2,Math.floor(random()*3))as Lane,distance:distance+4,kind:kinds[Math.min(2,Math.floor(random()*3))]}}
export const clearsObstacle=(action:Action,obstacle:Obstacle)=>obstacle.kind==='jump'?action==='jump':obstacle.kind==='duck'?action==='duck':true
export const advance=(state:RunState,input:{lane?:Lane;action?:Action},stageLength:number,random:()=>number=Math.random):RunState=>{if(state.status!=='running')return state;const lane=input.lane??state.lane;const action=input.action??'run';const distance=state.distance+1;const due=state.obstacles.filter(item=>item.distance===distance);const crashed=due.some(item=>item.lane===lane&&!clearsObstacle(action,item));let obstacles=state.obstacles.filter(item=>item.distance>distance);if(distance<stageLength&&distance%4===0)obstacles=[...obstacles,spawnObstacle(distance,random)];return{...state,lane,action,distance,obstacles,status:crashed?'crashed':distance>=stageLength?'clear':'running'}}
