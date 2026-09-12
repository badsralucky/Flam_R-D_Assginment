import {useEffect,useMemo,useRef,useState} from "react";
import {Activity,AlertTriangle,BarChart3,CheckCircle2,Leaf,Menu,Search,Settings2,SlidersHorizontal,Wifi,X} from "lucide-react";

type Metric="moisture"|"temperature"|"humidity"|"light";
type Point={t:number;v:number;anomaly?:boolean};
type Site={id:string;name:string;type:string;zone:string;values:Record<Metric,number>;health:number;anomalies:number};

const sites:Site[]=[
{id:"north",name:"North Greenhouse",type:"Greenhouse",zone:"Zone A",values:{moisture:61.4,temperature:25.8,humidity:64.2,light:714},health:98,anomalies:2},
{id:"roof",name:"Rooftop Garden",type:"Outdoor garden",zone:"Roof",values:{moisture:42.7,temperature:30.6,humidity:48.8,light:1124},health:91,anomalies:5},
{id:"lab",name:"Lab Nursery",type:"Research nursery",zone:"Lab 2",values:{moisture:69.3,temperature:23.4,humidity:71.6,light:486},health:99,anomalies:1}];
const metrics:Metric[]=["moisture","temperature","humidity","light"];
const label:Record<Metric,string>={moisture:"Soil moisture",temperature:"Temperature",humidity:"Humidity",light:"Light exposure"};
const unit:Record<Metric,string>={moisture:"%",temperature:"°C",humidity:"%",light:"lux"};

function makeData(site:Site,m:Metric,n=12000){const base=site.values[m],amp={moisture:8,temperature:2.8,humidity:10,light:190}[m],now=Date.now();return Array.from({length:n},(_,i)=>({t:now-(n-i)*3000,v:base+Math.sin(i/105)*amp*.6+Math.sin(i/31)*amp*.12+(i%1900===0?amp*2.1:0),anomaly:i%1900===0}));}
function reduceData(a:Point[],width:number){if(a.length<=width*2)return a;const step=Math.ceil(a.length/width),out:Point[]=[];for(let i=0;i<a.length;i+=step){const e=Math.min(i+step,a.length);let lo=a[i],hi=a[i];for(let j=i+1;j<e;j++){if(a[j].v<lo.v)lo=a[j];if(a[j].v>hi.v)hi=a[j]}out.push(lo,hi)}return out;}

function Chart({data,m,range}:{data:Point[];m:Metric;range:string}){
 const canvas=useRef<HTMLCanvasElement>(null);const [tip,setTip]=useState<{x:number;y:number;p:Point}|null>(null);
 const view=useMemo(()=>data.slice(range==="1h"?-1200:range==="6h"?-7200:range==="12h"?-12000:-12000),[data,range]);
 useEffect(()=>{const c=canvas.current;if(!c)return;const draw=()=>{const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;c.width=w*d;c.height=h*d;const x=c.getContext("2d")!;x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);const p={l:52,r:18,t:18,b:32},pw=w-p.l-p.r,ph=h-p.t-p.b,q=reduceData(view,Math.max(250,Math.floor(pw))),vs=q.map(z=>z.v),mn=Math.min(...vs),mx=Math.max(...vs),rg=Math.max(mx-mn,1),X=(i:number)=>p.l+i/(q.length-1)*pw,Y=(v:number)=>p.t+ph-(v-mn)/rg*ph;
 x.font="11px system-ui";x.fillStyle="#7f8985";x.strokeStyle="#e8ecea";for(let i=0;i<5;i++){const yy=p.t+ph*i/4;x.beginPath();x.moveTo(p.l,yy);x.lineTo(w-p.r,yy);x.stroke();x.fillText((mx-rg*i/4).toFixed(m==="light"?0:1),7,yy+4)}
 x.beginPath();q.forEach((z,i)=>i?x.lineTo(X(i),Y(z.v)):x.moveTo(X(i),Y(z.v)));x.lineTo(X(q.length-1),p.t+ph);x.lineTo(X(0),p.t+ph);x.closePath();const g=x.createLinearGradient(0,p.t,0,h);g.addColorStop(0,"#3f946722");g.addColorStop(1,"#3f946700");x.fillStyle=g;x.fill();
 x.beginPath();q.forEach((z,i)=>i?x.lineTo(X(i),Y(z.v)):x.moveTo(X(i),Y(z.v)));x.strokeStyle="#3f9467";x.lineWidth=2;x.stroke();q.forEach((z,i)=>{if(z.anomaly){x.fillStyle="#d4614e";x.beginPath();x.arc(X(i),Y(z.v),3,0,Math.PI*2);x.fill()}});x.fillStyle="#8b9591";x.fillText(range==="1h"?"1 hour ago":range==="6h"?"6 hours ago":range==="24h"?"24 hours ago":"12 hours ago",p.l,h-8);x.fillText("now",w-37,h-8)};draw();const ro=new ResizeObserver(draw);ro.observe(c);return()=>ro.disconnect()},[view,m,range]);
 const move=(e:React.MouseEvent<HTMLCanvasElement>)=>{const c=canvas.current;if(!c)return;const r=c.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(e.clientX-r.left-52)/(r.width-70))),i=Math.round(ratio*(view.length-1));setTip({x:e.clientX-r.left,y:e.clientY-r.top,p:view[i]})};
 return <div className="chart"><canvas ref={canvas} onMouseMove={move} onMouseLeave={()=>setTip(null)}/>{tip&&<div className="tip" style={{left:Math.min(tip.x+12,690),top:Math.max(8,tip.y-50)}}><b>{tip.p.v.toFixed(m==="light"?0:1)} {unit[m]}</b><span>{new Date(tip.p.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div>}</div>
}

export default function App(){
 const [siteId,setSiteId]=useState("north"),[m,setM]=useState<Metric>("moisture"),[range,setRange]=useState("12h"),[query,setQuery]=useState(""),[page,setPage]=useState("overview"),[paused,setPaused]=useState(false),[menu,setMenu]=useState(false);
 const site=sites.find(s=>s.id===siteId)!;const [data,setData]=useState(()=>makeData(site,m));
 useEffect(()=>setData(makeData(site,m)),[siteId,m]);
 useEffect(()=>{if(paused)return;const id=setInterval(()=>setData(a=>[...a.slice(-11999),{t:Date.now(),v:a[a.length-1].v+(Math.random()-.5)*.45}]),1200);return()=>clearInterval(id)},[paused]);
 const results=sites.filter(s=>(s.name+" "+s.type+" "+s.zone).toLowerCase().includes(query.toLowerCase()));
 return <div className="app">
 <aside className={menu?"side open":"side"}><div className="brand"><div className="logo"><Leaf size={17}/></div><div><b>PlantPulse</b><small>environmental telemetry</small></div><button className="close" onClick={()=>setMenu(false)}><X size={17}/></button></div>
 <div className="st">WORKSPACE</div>
 {[["overview",BarChart3,"Overview"],["sensors",Activity,"Sensor streams"],["anomalies",AlertTriangle,"Anomalies"],["thresholds",SlidersHorizontal,"Thresholds"]].map(([id,I,text])=><button className={page===id?"nav active":"nav"} onClick={()=>{setPage(id as string);setMenu(false)}} key={id as string}><I size={16}/>{text as string}{id==="sensors"&&<i>4</i>}{id==="anomalies"&&<i className="warn">{site.anomalies}</i>}</button>)}
 <div className="grow"/><div className="gateway"><span><Wifi size={12}/> Edge gateway</span><b>greenhouse-07</b><small><em/>Connected · 18 ms</small></div><div className="person"><strong>LB</strong><span>Lucky Badsra<small>Research workspace</small></span></div></aside>
 <main><header><div><small className="eyebrow">ENVIRONMENTAL INTELLIGENCE</small><h1>Telemetry dashboard</h1><p>Live conditions across your growing spaces.</p></div><div className="actions"><button className="hamb" onClick={()=>setMenu(true)}><Menu size={18}/></button><div className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search locations, zones..."/>{query&&<button onClick={()=>setQuery("")}><X size={13}/></button>}</div><button className="settings"><Settings2 size={16}/></button></div></header>
 {query&&<div className="results">{results.length?results.map(s=><button key={s.id} onClick={()=>{setSiteId(s.id);setQuery("")}}><span className="sdot"/><span><b>{s.name}</b><small>{s.type} · {s.zone}</small></span></button>):<p>No matching location.</p>}</div>}
 <div className="sitebar"><div className="sites">{sites.map(s=><button key={s.id} className={siteId===s.id?"site selected":"site"} onClick={()=>setSiteId(s.id)}><span className="sdot"/>{s.name}</button>)}</div><div className="live"><span className={paused?"":"pulse"}/>{paused?"Paused":"Live data"}<button onClick={()=>setPaused(!paused)}>{paused?"Resume":"Pause"}</button></div></div>
 {page==="overview"&&<><div className="metrics">{metrics.map(k=><button key={k} className={m===k?"metric selected":"metric"} onClick={()=>setM(k)}><span>{label[k]}</span><strong>{site.values[k].toFixed(1)}<small>{unit[k]}</small></strong><div className="mini"/><em>↑ {k==="light"?"8.2":"2.4"}% <i>vs previous period</i></em></button>)}</div>
 <section className="panel"><div className="head"><div><small>STREAM · {data.length.toLocaleString()} POINTS</small><h2>{label[m]}</h2><p>{site.name} · {site.zone}</p></div><div className="ranges">{["1h","6h","12h","24h"].map(x=><button className={range===x?"on":""} onClick={()=>setRange(x)} key={x}>{x}</button>)}</div></div><Chart data={data} m={m} range={range}/><div className="foot"><span><b className="line"/>signal</span><span><b className="adot"/>flagged anomaly</span><span className="perf">{reduceData(data,900).length.toLocaleString()} rendered samples · Canvas</span></div></section>
 <div className="bottom"><section className="panel"><div className="head"><div><small>SITE HEALTH</small><h2>{site.name}</h2></div><strong className="healthy"><CheckCircle2 size={14}/> {site.health}% healthy</strong></div><div className="stats"><div><b>{site.values[m].toFixed(1)} {unit[m]}</b><small>Current {label[m].toLowerCase()}</small></div><div><b>{site.anomalies}</b><small>Flagged events</small></div><div><b>4 / 4</b><small>Streams online</small></div></div></section><section className="panel notes"><div className="head"><div><small>PERFORMANCE</small><h2>How the chart stays responsive</h2></div></div><p><b>12,000</b> points are kept in the stream.</p><p><b>Min/max buckets</b> preserve short spikes.</p><p><b>Canvas</b> avoids thousands of DOM/SVG elements.</p></section></div></>}
 {page==="sensors"&&<Page title="Connected sensors" kicker="SENSOR STREAMS"><div className="list">{metrics.map(k=><div><span className="ok"/><b>{label[k]}</b><strong>{site.values[k].toFixed(1)} {unit[k]}</strong><small>Healthy · updated just now</small></div>)}</div></Page>}
 {page==="anomalies"&&<Page title={"Flagged events · "+site.name} kicker="ANOMALIES"><div className="list">{Array.from({length:site.anomalies},(_,i)=><div><AlertTriangle size={15} className="orange"/><b>Unusual {label[metrics[i%4]].toLowerCase()}</b><small>Detected {i+1}h ago</small><em>Review</em></div>)}</div></Page>}
 {page==="thresholds"&&<Page title="Monitoring thresholds" kicker="THRESHOLDS"><div className="thresholds">{metrics.map(k=><label>{label[k]}<div><input defaultValue={k==="temperature"?18:k==="light"?250:40}/><span>{unit[k]}</span></div><small>Reference threshold for monitoring alerts.</small></label>)}</div></Page>}
 <footer>PlantPulse · {site.name} · {paused?"Stream paused":"Streaming"}</footer></main></div>
}
function Page({title,kicker,children}:{title:string;kicker:string;children:React.ReactNode}){return <section className="panel page"><small>{kicker}</small><h2>{title}</h2>{children}</section>}