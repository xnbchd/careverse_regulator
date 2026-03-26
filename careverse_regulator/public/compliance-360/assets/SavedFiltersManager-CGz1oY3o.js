var M=Object.defineProperty;var y=Object.getOwnPropertySymbols;var $=Object.prototype.hasOwnProperty,P=Object.prototype.propertyIsEnumerable;var N=(s,a,t)=>a in s?M(s,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[a]=t,k=(s,a)=>{for(var t in a||(a={}))$.call(a,t)&&N(s,t,a[t]);if(y)for(var t of y(a))P.call(a,t)&&N(s,t,a[t]);return s};var S=(s,a,t)=>new Promise((o,l)=>{var c=r=>{try{i(t.next(r))}catch(p){l(p)}},d=r=>{try{i(t.throw(r))}catch(p){l(p)}},i=r=>r.done?o(r.value):Promise.resolve(r.value).then(c,d);i((t=t.apply(s,a)).next())});import{c as w,r as g,j as e,aj as D,ak as F,B as j,bQ as A,bD as T,am as C,bR as b,ac as L,G as x,k as O,Q as I,ao as V,as as B,at as _,au as R,av as U,aw as G,L as H,I as J,bS as Q,z as Y}from"./main-khLpwi1X.js";const q=[["path",{d:"M12 7v6",key:"lw1j43"}],["path",{d:"M15 10H9",key:"o6yqo3"}],["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]],W=w("bookmark-plus",q);const X=[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]],Z=w("bookmark",X);const K=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],ee=w("file-spreadsheet",K);function te(s,a,t){if(s.length===0)throw new Error("No data to export");const o=t||Object.keys(s[0]).map(h=>({key:h,label:h})),l=o.map(h=>h.label).join(","),c=s.map(h=>o.map(v=>{const f=h[v.key];if(f==null)return"";const u=String(f);return u.includes(",")||u.includes(`
`)||u.includes('"')?`"${u.replace(/"/g,'""')}"`:u}).join(",")),d=[l,...c].join(`
`),i=new Blob([d],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a"),p=URL.createObjectURL(i);r.setAttribute("href",p),r.setAttribute("download",`${a}.csv`),r.style.visibility="hidden",document.body.appendChild(r),r.click(),document.body.removeChild(r)}function se(s,a,t,o){if(s.length===0)throw new Error("No data to export");const l=o||Object.keys(s[0]).map(i=>({key:i,label:i}));let c=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .meta {
      font-size: 9pt;
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      font-size: 9pt;
    }
    td {
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      font-size: 9pt;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      margin-top: 20px;
      font-size: 8pt;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${t}</h1>
  <div class="meta">
    Generated on ${new Date().toLocaleString()} | Total Records: ${s.length}
  </div>
  <table>
    <thead>
      <tr>
        ${l.map(i=>`<th>${i.label}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${s.map(i=>`
        <tr>
          ${l.map(r=>{const p=i[r.key];return`<td>${p==null?"":String(p)}</td>`}).join("")}
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="footer">
    Careverse Regulator Portal - Confidential Document
  </div>
</body>
</html>
  `;const d=window.open("","_blank");if(!d)throw new Error("Unable to open print window. Please check your popup blocker.");d.document.write(c),d.document.close(),d.onload=()=>{d.focus(),d.print()}}function ae(s,a){return a?s.map(t=>{const o=k({},t);return Object.entries(a).forEach(([l,c])=>{c&&l in o&&(o[l]=c(o[l]))}),o}):s}function re(s,a,t){const o=ae(s,t.transformations);a==="csv"?te(o,t.filename,t.columns):se(o,t.filename,t.title,t.columns)}function le({data:s,config:a,disabled:t=!1,size:o="default",variant:l="outline"}){const[c,d]=g.useState(!1),i=r=>S(null,null,function*(){if(s.length===0){x.error("There is no data available to export.");return}d(!0);try{re(s,r,a),x.success(`Your data has been exported as ${r.toUpperCase()}.`)}catch(p){console.error("Export failed:",p),x.error(p.message||"Failed to export data. Please try again.")}finally{d(!1)}});return e.jsxs(D,{children:[e.jsx(F,{asChild:!0,children:e.jsx(j,{variant:l,size:o,disabled:t||c||s.length===0,className:"gap-2",children:c?e.jsxs(e.Fragment,{children:[e.jsx(A,{className:"w-4 h-4 animate-spin"}),e.jsx("span",{children:"Exporting..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(T,{className:"w-4 h-4"}),e.jsx("span",{children:"Export"})]})})}),e.jsxs(C,{align:"end",children:[e.jsxs(b,{onClick:()=>i("csv"),disabled:c,className:"cursor-pointer",children:[e.jsx(ee,{className:"w-4 h-4 mr-2"}),"Export as CSV"]}),e.jsxs(b,{onClick:()=>i("pdf"),disabled:c,className:"cursor-pointer",children:[e.jsx(L,{className:"w-4 h-4 mr-2"}),"Export as PDF"]})]})]})}function ie({storageKey:s,currentFilters:a,onApplyFilters:t,getFilterSummary:o}){const[l,c]=g.useState([]),[d,i]=g.useState(!1),[r,p]=g.useState("");g.useEffect(()=>{try{const n=localStorage.getItem(s);n&&c(JSON.parse(n))}catch(n){console.error("Failed to load saved filters:",n)}},[s]);const h=n=>{try{localStorage.setItem(s,JSON.stringify(n)),c(n)}catch(m){console.error("Failed to save filters:",m),x.error("Could not save filter preset. Please try again.")}},v=()=>{if(!r.trim()){x.error("Please enter a name for this filter preset.");return}const n={id:Date.now().toString(),name:r.trim(),filters:a,createdAt:new Date().toISOString()},m=[...l,n];h(m),x.success(`Filter preset "${r}" has been saved.`),p(""),i(!1)},f=n=>{t(n.filters),x.success(`Applied filter preset "${n.name}".`)},u=n=>{const m=l.filter(z=>z.id!==n);h(m),x.success("Filter preset has been removed.")},E=()=>o(a).trim().length>0;return e.jsxs(e.Fragment,{children:[e.jsxs(D,{children:[e.jsx(F,{asChild:!0,children:e.jsxs(j,{variant:"outline",size:"default",className:"gap-2 whitespace-nowrap",children:[e.jsx(Z,{className:"w-4 h-4"}),e.jsx("span",{children:"Saved Filters"}),l.length>0&&e.jsx(O,{variant:"secondary",className:"ml-1 px-1.5 py-0 text-xs h-5",children:l.length})]})}),e.jsxs(C,{align:"end",className:"w-[300px]",children:[l.length===0?e.jsx("div",{className:"p-4 text-center text-sm text-muted-foreground",children:"No saved filter presets"}):e.jsxs(e.Fragment,{children:[l.map(n=>e.jsxs(b,{className:"flex items-start justify-between gap-2 p-3 cursor-pointer",onSelect:m=>{m.preventDefault()},children:[e.jsxs("div",{className:"flex-1 min-w-0",onClick:()=>f(n),children:[e.jsx("div",{className:"font-medium text-sm mb-1",children:n.name}),e.jsx("div",{className:"text-xs text-muted-foreground line-clamp-2",children:o(n.filters)})]}),e.jsx(j,{variant:"ghost",size:"icon",className:"h-6 w-6 flex-shrink-0",onClick:m=>{m.stopPropagation(),u(n.id)},children:e.jsx(I,{className:"w-3 h-3 text-destructive"})})]},n.id)),e.jsx(V,{})]}),e.jsxs(b,{onSelect:()=>i(!0),disabled:!E(),className:"cursor-pointer",children:[e.jsx(W,{className:"w-4 h-4 mr-2"}),"Save Current Filters"]})]})]}),e.jsx(B,{open:d,onOpenChange:i,children:e.jsxs(_,{className:"sm:max-w-[425px]",children:[e.jsxs(R,{children:[e.jsx(U,{children:"Save Filter Preset"}),e.jsx(G,{children:"Give this filter preset a name to save it for future use."})]}),e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(H,{htmlFor:"filter-name",children:"Preset Name"}),e.jsx(J,{id:"filter-name",value:r,onChange:n=>p(n.target.value),placeholder:"e.g., Pending Inspections Last 30 Days",maxLength:50,onKeyDown:n=>{n.key==="Enter"&&v()}}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[r.length,"/50 characters"]})]}),e.jsxs("div",{className:"p-3 bg-muted rounded-lg",children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground mb-1",children:"Current Filters:"}),e.jsx("p",{className:"text-sm",children:o(a)||"No filters applied"})]})]}),e.jsxs(Q,{children:[e.jsx(j,{variant:"outline",onClick:()=>i(!1),children:"Cancel"}),e.jsxs(j,{onClick:v,disabled:!r.trim(),children:[e.jsx(Y,{className:"w-4 h-4 mr-2"}),"Save Preset"]})]})]})})]})}export{le as E,ie as S};
//# sourceMappingURL=SavedFiltersManager-CGz1oY3o.js.map
