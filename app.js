// ===== Helpers =====
const $  = (q)=>document.querySelector(q);
const $$ = (q)=>Array.from(document.querySelectorAll(q));
const num = (v)=> (v===""||v===null)?NaN:Number(v);

// ===== Modelo (TU config real) =====
// y = intercept + Σ coef[i] * x[i]
let MODEL = {
  features: ["Age","StudyTimeWeekly","Absences","Tutoring","ParentalSupport"],
  coef: [
    0.028792187353488794,
    -0.09926436783920209,
    0.237307847643593,
    0.152105465475802,
    0.1869190039828954
  ],
  intercept: 2.6021809926205206,
  standardize: false,
  mean: {},
  std: {},
  risk_threshold: 2.0
};

// ===== UI State =====
function refreshState(){
  $("#thrPill").textContent = MODEL.risk_threshold;
  $("#cfgBox").value = JSON.stringify(MODEL, null, 2);
  $("#modelState").textContent = `Features: ${MODEL.features.length} • Coef: ${MODEL.coef.length} • Intercept: ${MODEL.intercept}`;
  $("#modelPreview").textContent = JSON.stringify({
    features: MODEL.features, coef: MODEL.coef, intercept: MODEL.intercept,
    standardize: MODEL.standardize, risk_threshold: MODEL.risk_threshold
  }, null, 2);
}
refreshState();

// ===== Tabs =====
$$(".tab").forEach(btn => btn.onclick = () => {
  $$(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  ["student","coord","config"].forEach(id => $("#"+id).style.display="none");
  $("#"+btn.dataset.tab).style.display = "grid";
});

// ===== Predicción =====
function z(x, name){
  if(!MODEL.standardize) return x;
  const mu = MODEL.mean?.[name], sd = MODEL.std?.[name];
  if(typeof mu !== "number" || typeof sd !== "number" || sd === 0) return x;
  return (x - mu) / sd;
}
function predictOne(obj){
  const {features, coef, intercept} = MODEL;
  if(coef.length !== features.length) throw new Error("coef y features con distinto tamaño");
  let y = Number(intercept) || 0;
  for(let i=0;i<features.length;i++){
    const f = features[i];
    const x = z(num(obj[f]), f);
    y += coef[i]*x;
  }
  return y;
}
function adviceFor(gpa){
  if (gpa < MODEL.risk_threshold) return `⚠ Estás en zona de riesgo. Sube horas de estudio, reduce ausencias y considera tutoría.`;
  if (gpa < 3.0) return `Vas bien, suma +2 h/sem de estudio y mantén constancia.`;
  return `¡Excelente! Mantén hábitos y apoya a compañeros.`;
}

// ===== Estudiante =====
$("#predictBtn").onclick = () => {
  const inp = {
    Age: num($("#AgeOut").value),
    StudyTimeWeekly: num($("#StudyOut").value),
    Absences: num($("#AbsOut").value),
    Tutoring: num($("#Tutoring").value),
    ParentalSupport: num($("#ParentalSupport").value)
  };
  const missing = MODEL.features.filter(f => isNaN(inp[f]));
  if (missing.length){
    $("#predOut").innerHTML = `Faltan valores en: <b>${missing.join(", ")}</b>`;
    $("#advice").innerHTML = "";
    return;
  }
  const gpa = predictOne(inp);
  $("#predOut").innerHTML = `GPA estimado: <b>${gpa.toFixed(2)}</b>`;
  $("#advice").innerHTML = adviceFor(gpa);
};

// ===== Coordinador (múltiples filas) =====
let coordCount = 0;

$("#predictCoordBtn").onclick = () => {
  coordCount++;
  const inp = {
    Age: num($("#CAge").value),
    StudyTimeWeekly: num($("#CStudyTimeWeekly").value),
    Absences: num($("#CAbsences").value),
    Tutoring: num($("#CTutoring").value),
    ParentalSupport: num($("#CParentalSupport").value)
  };
  const missing = MODEL.features.filter(f => isNaN(inp[f]));
  if (missing.length){
    alert("Faltan valores en: " + missing.join(", "));
    return;
  }
  const gpa = predictOne(inp);
  const riskFlag = gpa < MODEL.risk_threshold;
  const riskText = riskFlag ? "⚠ Riesgo" : "OK";

  const tbody = $("#coordTable tbody");
  const tr = document.createElement("tr");
  if (riskFlag) tr.classList.add("risk");
  tr.innerHTML = `
    <td>${coordCount}</td>
    <td>${inp.Age}</td>
    <td>${inp.StudyTimeWeekly}</td>
    <td>${inp.Absences}</td>
    <td>${inp.Tutoring}</td>
    <td>${inp.ParentalSupport}</td>
    <td>${gpa.toFixed(2)}</td>
    <td>${riskText}</td>
  `;
  tbody.appendChild(tr);
  $("#coordTable").style.display = "table";
};

$("#clearCoordBtn").onclick = () => {
  coordCount = 0;
  $("#coordTable tbody").innerHTML = "";
  $("#coordTable").style.display = "none";
};

// ===== Config UI =====
$("#applyCfg").onclick = ()=>{
  try{
    const cfg = JSON.parse($("#cfgBox").value);
    if (!Array.isArray(cfg.features) || !Array.isArray(cfg.coef)) throw new Error("features/coef inválidos");
    if (cfg.coef.length !== cfg.features.length) throw new Error("coef y features con distinto tamaño");
    MODEL = {...MODEL, ...cfg};
    refreshState();
    alert("✅ Configuración aplicada");
  }catch(e){ alert("❌ Error en JSON: " + e.message); }
};

$("#downloadCfg").onclick = (e)=>{
  e.preventDefault();
  const blob = new Blob([JSON.stringify(MODEL,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "model_config.json"; a.click();
  URL.revokeObjectURL(url);
};
