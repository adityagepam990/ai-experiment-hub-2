const fmt={
  pct:x=>`${(x*100).toFixed(2)}%`,
  num:(x,n=2)=>Number(x).toFixed(n),
  min:s=>`${(s/60).toFixed(1)} min`
};

const pretty={
  cross_entropy:"Cross Entropy",
  label_smoothing:"Label Smoothing",
  focal:"Focal Loss",
  answer_weighted:"Answer Weighted"
};

const colors=["#7aa2ff","#70e1c1","#f4c86a","#d997ff"];

fetch("data/comparison.json")
  .then(r=>r.json())
  .then(render)
  .catch(err=>{
    document.body.innerHTML=`<main class="wrap"><section class="panel"><h2>Could not load dashboard data</h2><pre>${err}</pre></section></main>`;
  });

function render(data){
  const exps=data.experiments;
  const labels=exps.map(x=>pretty[x.loss]||x.loss);

  const minEval=exps.reduce((a,b)=>a.eval_loss<b.eval_loss?a:b);
  const minPpl=exps.reduce((a,b)=>a.perplexity<b.perplexity?a:b);
  const maxTok=exps.reduce((a,b)=>a.token_accuracy>b.token_accuracy?a:b);
  const maxAns=exps.reduce((a,b)=>a.answer_token_accuracy>b.answer_token_accuracy?a:b);

  const cards=[
    ["Lowest eval loss",fmt.num(minEval.eval_loss,3),pretty[minEval.loss]],
    ["Lowest perplexity",fmt.num(minPpl.perplexity,2),pretty[minPpl.loss]],
    ["Highest token accuracy",fmt.pct(maxTok.token_accuracy),pretty[maxTok.loss]],
    ["Highest answer accuracy",fmt.pct(maxAns.answer_token_accuracy),pretty[maxAns.loss]]
  ];

  document.getElementById("summaryCards").innerHTML=cards.map(([l,v,s])=>`
    <article class="card"><div class="label">${l}</div><div class="value">${v}</div><div class="sub">${s}</div></article>
  `).join("");

  const opts={
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:"#dce6ff"}},tooltip:{mode:"index",intersect:false}},
    scales:{
      x:{ticks:{color:"#a8b3cf"},grid:{color:"rgba(255,255,255,.06)"}},
      y:{ticks:{color:"#a8b3cf"},grid:{color:"rgba(255,255,255,.06)"}}
    }
  };

  bar("evalLossChart",labels,exps.map(x=>x.eval_loss),"Eval loss",opts);
  bar("perplexityChart",labels,exps.map(x=>x.perplexity),"Perplexity",opts);
  bar("tokenAccuracyChart",labels,exps.map(x=>x.token_accuracy*100),"Token accuracy (%)",opts);
  bar("vramChart",labels,exps.map(x=>x.peak_reserved_vram_gb),"Peak reserved VRAM (GB)",opts);
  bar("runtimeChart",labels,exps.map(x=>x.train_runtime_seconds/60),"Runtime (min)",opts);

  new Chart(document.getElementById("answerChart"),{
    type:"bar",
    data:{labels,datasets:[
      {label:"Answer eval loss",data:exps.map(x=>x.answer_eval_loss),backgroundColor:"#7aa2ff",borderRadius:7},
      {label:"Answer accuracy (%)",data:exps.map(x=>x.answer_token_accuracy*100),backgroundColor:"#70e1c1",borderRadius:7,yAxisID:"y1"}
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"#dce6ff"}}},
      scales:{
        x:{ticks:{color:"#a8b3cf"},grid:{color:"rgba(255,255,255,.06)"}},
        y:{position:"left",ticks:{color:"#a8b3cf"},grid:{color:"rgba(255,255,255,.06)"},title:{display:true,text:"Answer loss",color:"#a8b3cf"}},
        y1:{position:"right",ticks:{color:"#a8b3cf"},grid:{drawOnChartArea:false},title:{display:true,text:"Answer accuracy (%)",color:"#a8b3cf"}}
      }
    }
  });

  const mins={
    eval_loss:Math.min(...exps.map(x=>x.eval_loss)),
    perplexity:Math.min(...exps.map(x=>x.perplexity)),
    answer_eval_loss:Math.min(...exps.map(x=>x.answer_eval_loss))
  };
  const maxs={
    token_accuracy:Math.max(...exps.map(x=>x.token_accuracy)),
    answer_token_accuracy:Math.max(...exps.map(x=>x.answer_token_accuracy))
  };

  document.querySelector("#resultsTable tbody").innerHTML=exps.map(x=>`
    <tr>
      <td>${pretty[x.loss]}</td>
      <td class="${x.eval_loss===mins.eval_loss?"best":""}">${fmt.num(x.eval_loss,3)}</td>
      <td class="${x.perplexity===mins.perplexity?"best":""}">${fmt.num(x.perplexity,2)}</td>
      <td class="${x.token_accuracy===maxs.token_accuracy?"best":""}">${fmt.pct(x.token_accuracy)}</td>
      <td class="${x.answer_eval_loss===mins.answer_eval_loss?"best":""}">${fmt.num(x.answer_eval_loss,3)}</td>
      <td class="${x.answer_token_accuracy===maxs.answer_token_accuracy?"best":""}">${fmt.pct(x.answer_token_accuracy)}</td>
      <td>${fmt.num(x.peak_reserved_vram_gb,2)}</td>
      <td>${fmt.min(x.train_runtime_seconds)}</td>
    </tr>
  `).join("");
}

function bar(id,labels,data,label,options){
  new Chart(document.getElementById(id),{
    type:"bar",
    data:{labels,datasets:[{label,data,backgroundColor:colors,borderRadius:7}]},
    options
  });
}
