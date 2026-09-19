import{describe,expect,it}from'vitest'
import{advance,clearsObstacle,createRun,spawnObstacle}from'./runnerEngine'
describe('runner engine',()=>{
 it('spawns deterministic obstacle lanes and kinds',()=>{expect(spawnObstacle(3,()=>0)).toMatchObject({lane:0,kind:'jump',distance:7})})
 it('maps plain obstacles to forgiving actions',()=>{expect(clearsObstacle('jump',{id:'a',lane:0,distance:1,kind:'jump'})).toBe(true);expect(clearsObstacle('run',{id:'a',lane:0,distance:1,kind:'duck'})).toBe(false)})
 it('advances and clears a stage',()=>{let state=createRun();state=advance(state,{},1);expect(state.status).toBe('clear')})
 it('crashes only when obstacle and player share a lane',()=>{const obstacle={id:'a',lane:1 as const,distance:1,kind:'jump' as const};expect(advance(createRun([obstacle]),{},5).status).toBe('crashed');expect(advance(createRun([obstacle]),{lane:0},5).status).toBe('running')})
})
