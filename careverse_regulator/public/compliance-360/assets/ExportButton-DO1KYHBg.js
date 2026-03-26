var v=Object.defineProperty;var f=Object.getOwnPropertySymbols;var k=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable;var x=(t,o,e)=>o in t?v(t,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[o]=e,b=(t,o)=>{for(var e in o||(o={}))k.call(o,e)&&x(t,e,o[e]);if(f)for(var e of f(o))E.call(o,e)&&x(t,e,o[e]);return t};var y=(t,o,e)=>new Promise((r,l)=>{var i=n=>{try{s(e.next(n))}catch(d){l(d)}},c=n=>{try{s(e.throw(n))}catch(d){l(d)}},s=n=>n.done?r(n.value):Promise.resolve(n.value).then(i,c);s((e=e.apply(t,o)).next())});import{c as g,m as $,j as a,ay as C,az as D,B as M,a$ as z,bK as N,aB as F,bX as w,$ as T,J as m}from"./main-rNMFhHbM.js";const A=[["path",{d:"m21 16-4 4-4-4",key:"f6ql7i"}],["path",{d:"M17 20V4",key:"1ejh1v"}],["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}]],_=g("arrow-up-down",A);const S=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],V=g("file-spreadsheet",S);function P(t,o,e){if(t.length===0)throw new Error("No data to export");const r=e||Object.keys(t[0]).map(p=>({key:p,label:p})),l=r.map(p=>p.label).join(","),i=t.map(p=>r.map(j=>{const u=p[j.key];if(u==null)return"";const h=String(u);return h.includes(",")||h.includes(`
`)||h.includes('"')?`"${h.replace(/"/g,'""')}"`:h}).join(",")),c=[l,...i].join(`
`),s=new Blob([c],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a"),d=URL.createObjectURL(s);n.setAttribute("href",d),n.setAttribute("download",`${o}.csv`),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n)}function U(t,o,e,r){if(t.length===0)throw new Error("No data to export");const l=r||Object.keys(t[0]).map(s=>({key:s,label:s}));let i=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${e}</title>
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
  <h1>${e}</h1>
  <div class="meta">
    Generated on ${new Date().toLocaleString()} | Total Records: ${t.length}
  </div>
  <table>
    <thead>
      <tr>
        ${l.map(s=>`<th>${s.label}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${t.map(s=>`
        <tr>
          ${l.map(n=>{const d=s[n.key];return`<td>${d==null?"":String(d)}</td>`}).join("")}
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="footer">
    Careverse Regulator Portal - Confidential Document
  </div>
</body>
</html>
  `;const c=window.open("","_blank");if(!c)throw new Error("Unable to open print window. Please check your popup blocker.");c.document.write(i),c.document.close(),c.onload=()=>{c.focus(),c.print()}}function B(t,o){return o?t.map(e=>{const r=b({},e);return Object.entries(o).forEach(([l,i])=>{i&&l in r&&(r[l]=i(r[l]))}),r}):t}function L(t,o,e){const r=B(t,e.transformations);o==="csv"?P(r,e.filename,e.columns):U(r,e.filename,e.title,e.columns)}function I({data:t,config:o,disabled:e=!1,size:r="default",variant:l="outline"}){const[i,c]=$.useState(!1),s=n=>y(null,null,function*(){if(t.length===0){m.error("There is no data available to export.");return}c(!0);try{L(t,n,o),m.success(`Your data has been exported as ${n.toUpperCase()}.`)}catch(d){console.error("Export failed:",d),m.error(d.message||"Failed to export data. Please try again.")}finally{c(!1)}});return a.jsxs(C,{children:[a.jsx(D,{asChild:!0,children:a.jsx(M,{variant:l,size:r,disabled:e||i||t.length===0,className:"gap-2",children:i?a.jsxs(a.Fragment,{children:[a.jsx(z,{className:"w-4 h-4 animate-spin"}),a.jsx("span",{children:"Exporting..."})]}):a.jsxs(a.Fragment,{children:[a.jsx(N,{className:"w-4 h-4"}),a.jsx("span",{children:"Export"})]})})}),a.jsxs(F,{align:"end",children:[a.jsxs(w,{onClick:()=>s("csv"),disabled:i,className:"cursor-pointer",children:[a.jsx(V,{className:"w-4 h-4 mr-2"}),"Export as CSV"]}),a.jsxs(w,{onClick:()=>s("pdf"),disabled:i,className:"cursor-pointer",children:[a.jsx(T,{className:"w-4 h-4 mr-2"}),"Export as PDF"]})]})]})}export{_ as A,I as E};
//# sourceMappingURL=ExportButton-DO1KYHBg.js.map
