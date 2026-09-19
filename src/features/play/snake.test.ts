import{describe,expect,it}from'vitest'
import{createSnake,nextTarget,placeFood,stepSnake,turnSnake}from'./snake'
describe('snake engine',()=>{
 it('moves one cell without growing',()=>{const next=stepSnake(createSnake());expect(next.snake).toEqual([{x:3,y:2},{x:2,y:2}]);expect(next.score).toBe(0)})
 it('eats, grows, scores and advances target',()=>{const state=createSnake({x:3,y:2});const next=stepSnake(state,()=>0);expect(next.snake).toHaveLength(3);expect(next.score).toBe(1);expect(next.target).toBe(2);expect(next.food).not.toEqual({x:3,y:2})})
 it('rejects an immediate reverse',()=>{expect(turnSnake(createSnake(),'left').direction).toBe('right');expect(turnSnake(createSnake(),'up').direction).toBe('up')})
 it('ends at a wall',()=>{let state=createSnake();state={...state,snake:[{x:5,y:2}],direction:'right'};expect(stepSnake(state).over).toBe(true)})
 it('never places food on the snake',()=>{const snake=[{x:0,y:0},{x:1,y:0}];expect(snake).not.toContainEqual(placeFood(snake,()=>0))})
})

describe('shared difficulty targets',()=>{
  it('starts with an age-appropriate target for each level',()=>{
    expect(createSnake(undefined,1).target).toBe(1)
    expect(createSnake(undefined,2).target).toBe(6)
  })
  it('keeps level-one targets within one to five',()=>{
    expect(nextTarget(5,1)).toBe(1)
    expect(nextTarget(4,1)).toBe(5)
  })
})
