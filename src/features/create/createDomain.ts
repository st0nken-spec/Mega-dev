export type CreateMode = 'color' | 'draw' | 'trace'
export type ColoringPage = { id: string; name: string; emoji: string; regions: { id: string; path: string }[] }
export type TraceGuide = { id: string; name: string; symbol: string }

export const palette = ['#e85d75','#f6b73c','#56b870','#3d8bfd','#845ec2','#17322b'] as const
export const coloringPages: ColoringPage[] = [
  {id:'rocket',name:'Raket',emoji:'▲',regions:[
    {id:'body',path:'M100 22 C138 54 145 110 100 174 C55 110 62 54 100 22Z'},
    {id:'window',path:'M100 57 A20 20 0 1 1 99.9 57Z'},
    {id:'left-wing',path:'M67 116 L32 157 L72 148Z'},
    {id:'right-wing',path:'M133 116 L168 157 L128 148Z'},
    {id:'flame',path:'M84 157 Q100 198 116 157Z'},
  ]},
  {id:'fish',name:'Fisk',emoji:'><',regions:[
    {id:'body',path:'M34 100 Q78 42 145 73 Q165 83 174 100 Q165 117 145 127 Q78 158 34 100Z'},
    {id:'tail',path:'M44 100 L10 62 L18 100 L10 138Z'},
    {id:'fin',path:'M92 73 L116 36 L128 78Z'},
    {id:'eye',path:'M145 86 A8 8 0 1 1 144.9 86Z'},
  ]},
  {id:'flower',name:'Blomma',emoji:'✿',regions:[
    {id:'petal-1',path:'M100 75 C58 54 73 14 100 50 C127 14 142 54 100 75Z'},
    {id:'petal-2',path:'M125 100 C146 58 186 73 150 100 C186 127 146 142 125 100Z'},
    {id:'petal-3',path:'M100 125 C142 146 127 186 100 150 C73 186 58 146 100 125Z'},
    {id:'petal-4',path:'M75 100 C54 142 14 127 50 100 C14 73 54 58 75 100Z'},
    {id:'middle',path:'M100 72 A28 28 0 1 1 99.9 72Z'},
  ]},
]
export const traceGuides: TraceGuide[] = [
  {id:'circle',name:'Cirkel',symbol:'○'}, {id:'triangle',name:'Triangel',symbol:'△'},
  {id:'letter-a',name:'Bokstaven A',symbol:'A'}, {id:'number-5',name:'Siffran 5',symbol:'5'},
]
export function nextRegionColor(current: string | undefined, selected: string){ return current === selected ? '#ffffff' : selected }
