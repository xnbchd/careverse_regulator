var y=Object.defineProperty;var x=Object.getOwnPropertySymbols;var v=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable;var f=(t,o,e)=>o in t?y(t,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[o]=e,b=(t,o)=>{for(var e in o||(o={}))v.call(o,e)&&f(t,e,o[e]);if(x)for(var e of x(o))E.call(o,e)&&f(t,e,o[e]);return t};var g=(t,o,e)=>new Promise((n,l)=>{var i=r=>{try{s(e.next(r))}catch(d){l(d)}},c=r=>{try{s(e.throw(r))}catch(d){l(d)}},s=r=>r.done?n(r.value):Promise.resolve(r.value).then(i,c);s((e=e.apply(t,o)).next())});import{g as k,r as C,j as a,p as D,q as $,B as F,_ as N,a8 as z,s as T,t as w,a6 as S,az as m}from"./main-CNmCbRdM.js";import{F as A}from"./file-spreadsheet-x1Mj4QHN.js";const M=[["path",{d:"m21 16-4 4-4-4",key:"f6ql7i"}],["path",{d:"M17 20V4",key:"1ejh1v"}],["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}]],_=k("arrow-up-down",M);function P(t,o,e){if(t.length===0)throw new Error("No data to export");const n=e||Object.keys(t[0]).map(p=>({key:p,label:p})),l=n.map(p=>p.label).join(","),i=t.map(p=>n.map(j=>{const h=p[j.key];if(h==null)return"";const u=String(h);return u.includes(",")||u.includes(`
`)||u.includes('"')?`"${u.replace(/"/g,'""')}"`:u}).join(",")),c=[l,...i].join(`
`),s=new Blob([c],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a"),d=URL.createObjectURL(s);r.setAttribute("href",d),r.setAttribute("download",`${o}.csv`),r.style.visibility="hidden",document.body.appendChild(r),r.click(),document.body.removeChild(r)}function U(t,o,e,n){if(t.length===0)throw new Error("No data to export");const l=n||Object.keys(t[0]).map(s=>({key:s,label:s}));let i=`
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
          ${l.map(r=>{const d=s[r.key];return`<td>${d==null?"":String(d)}</td>`}).join("")}
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="footer">
    Careverse Regulator Portal - Confidential Document
  </div>
</body>
</html>
  `;const c=window.open("","_blank");if(!c)throw new Error("Unable to open print window. Please check your popup blocker.");c.document.write(i),c.document.close(),c.onload=()=>{c.focus(),c.print()}}function V(t,o){return o?t.map(e=>{const n=b({},e);return Object.entries(o).forEach(([l,i])=>{i&&l in n&&(n[l]=i(n[l]))}),n}):t}function L(t,o,e){const n=V(t,e.transformations);o==="csv"?P(n,e.filename,e.columns):U(n,e.filename,e.title,e.columns)}function q({data:t,config:o,disabled:e=!1,size:n="default",variant:l="outline"}){const[i,c]=C.useState(!1),s=r=>g(null,null,function*(){if(t.length===0){m.error("There is no data available to export.");return}c(!0);try{L(t,r,o),m.success(`Your data has been exported as ${r.toUpperCase()}.`)}catch(d){console.error("Export failed:",d),m.error(d.message||"Failed to export data. Please try again.")}finally{c(!1)}});return a.jsxs(D,{children:[a.jsx($,{asChild:!0,children:a.jsx(F,{variant:l,size:n,disabled:e||i||t.length===0,className:"gap-2",children:i?a.jsxs(a.Fragment,{children:[a.jsx(N,{className:"w-4 h-4 animate-spin"}),a.jsx("span",{children:"Exporting..."})]}):a.jsxs(a.Fragment,{children:[a.jsx(z,{className:"w-4 h-4"}),a.jsx("span",{children:"Export"})]})})}),a.jsxs(T,{align:"end",children:[a.jsxs(w,{onClick:()=>s("csv"),disabled:i,className:"cursor-pointer",children:[a.jsx(A,{className:"w-4 h-4 mr-2"}),"Export as CSV"]}),a.jsxs(w,{onClick:()=>s("pdf"),disabled:i,className:"cursor-pointer",children:[a.jsx(S,{className:"w-4 h-4 mr-2"}),"Export as PDF"]})]})]})}export{_ as A,q as E};
//# sourceMappingURL=ExportButton-CT4bhIcj.js.map
