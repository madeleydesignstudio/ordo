import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { U as Un, E } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:url';
import 'node:net';
import 'node:fs';
import 'node:path';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import '@tanstack/react-router';
import 'node:async_hooks';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import '@radix-ui/react-slot';
import '@radix-ui/react-dialog';
import '@radix-ui/react-tooltip';
import '@radix-ui/react-accordion';
import '@radix-ui/react-separator';
import '@radix-ui/react-label';
import '@radix-ui/react-select';
import '@tanstack/react-query';
import 'cmdk';
import 'react-dom/server';
import 'node:stream/web';

const D = ({ currentDate: t, onDateChange: n }) => {
  const [a, o] = useState([]), [d, m] = useState({ start: -3, end: 3 }), y = (r) => {
    const f = [];
    for (let l = -10; l < 10; l++) {
      const i = new Date(r);
      i.setDate(r.getDate() + l), f.push(i);
    }
    o(f);
  };
  useEffect(() => {
    y(t);
  }, [t]);
  const b = () => {
    const r = new Date(t);
    if (r.setDate(t.getDate() - 1), n(r), a.findIndex((l) => l.toDateString() === r.toDateString()) < 5) {
      const l = new Date(a[0]), i = [...a];
      for (let c = 1; c <= 10; c++) {
        const u = new Date(l);
        u.setDate(l.getDate() - c), i.unshift(u);
      }
      o(i.slice(0, 20));
    }
  }, S = () => {
    const r = new Date(t);
    if (r.setDate(t.getDate() + 1), n(r), a.findIndex((l) => l.toDateString() === r.toDateString()) > a.length - 5) {
      const l = new Date(a[a.length - 1]), i = [...a];
      for (let c = 1; c <= 10; c++) {
        const u = new Date(l);
        u.setDate(l.getDate() + c), i.push(u);
      }
      o(i.slice(-20));
    }
  }, x = a.slice(a.findIndex((r) => r.toDateString() === t.toDateString()) + d.start, a.findIndex((r) => r.toDateString() === t.toDateString()) + d.end + 1), C = (r) => ({ day: r.toLocaleDateString("en-US", { weekday: "long" }), date: r.getDate(), isSelected: r.toDateString() === t.toDateString(), isToday: r.toDateString() === (/* @__PURE__ */ new Date()).toDateString() });
  return jsx("div", { className: "h-[15%] border-t border-neutral-600 w-full", children: jsxs("div", { className: "flex flex-col w-full h-full", children: [jsx("div", { className: "flex justify-center items-center w-full h-full", children: x.map((r, f) => {
    const { day: l, date: i, isSelected: c, isToday: u } = C(r);
    return jsxs("div", { onClick: () => n(r), className: `flex flex-col w-full text-neutral-300 h-full min-w-[120px] max-h-[200px] cursor-pointer
              ${c ? "bg-neutral-600/50" : ""}
              ${u ? "bg-purple-800/30" : ""}
              ${f === x.length - 1 ? "" : "border-r"} 
              border-neutral-600
              ${c && u ? "bg-purple-800/30" : ""}`, children: [jsxs("div", { className: "flex justify-between p-1 font-bold", children: [jsx("span", { className: "text-xs uppercase", children: l }), jsx("span", { className: "text-xs", children: i })] }), jsx("div", { className: "flex-1 overflow-y-auto p-1" })] }, r.toISOString());
  }) }), jsx("div", { className: "absolute bottom-2", children: jsx("button", { onClick: b, className: "text-neutral-400", children: jsx(ChevronLeftIcon, { className: "h-5 w-5" }) }) }), jsx("div", { className: "absolute bottom-2 right-3", children: jsx("button", { onClick: S, className: "text-neutral-400", children: jsx(ChevronRightIcon, { className: "h-5 w-5" }) }) })] }) });
}, $ = ({ currentDate: t, onDateChange: n }) => jsxs("div", { className: "flex items-center gap-2", children: [jsx(E, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
  const m = new Date(t);
  m.setDate(t.getDate() - 1), n(m);
}, children: jsx(ChevronLeft, { className: "h-4 w-4" }) }), jsx("h1", { className: "text-center text-xs text-neutral-300 cursor-pointer", onClick: () => n(/* @__PURE__ */ new Date()), children: "Today" }), jsx(E, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
  const m = new Date(t);
  m.setDate(t.getDate() + 1), n(m);
}, children: jsx(ChevronRight, { className: "h-4 w-4" }) })] }), L = (t) => {
  const n = t.toLowerCase();
  return n.includes("sunny") || n.includes("clear") ? "\u2600\uFE0F" : n.includes("rain") ? "\u{1F327}\uFE0F" : n.includes("cloud") ? "\u2601\uFE0F" : n.includes("snow") ? "\u2744\uFE0F" : n.includes("thunder") || n.includes("storm") ? "\u26C8\uFE0F" : n.includes("mist") || n.includes("fog") ? "\u{1F32B}\uFE0F" : n.includes("wind") ? "\u{1F4A8}" : n.includes("overcast") ? "\u{1F325}\uFE0F" : "\u{1F321}\uFE0F";
}, R = () => {
  const [t, n] = useState(null);
  return useEffect(() => {
    "geolocation" in navigator && navigator.geolocation.getCurrentPosition(async (a) => {
      try {
        const d = await (await fetch(`https://api.weatherapi.com/v1/current.json?key=d6cb802840b2478bb0e233636252003&q=${a.coords.latitude},${a.coords.longitude}`)).json();
        n({ temp: Math.round(d.current.temp_c), conditions: d.current.condition.text });
      } catch (o) {
        console.error("Error fetching weather:", o);
      }
    });
  }, []), t ? jsx("div", { className: "flex items-center gap-1 text-xs flex-col px-2.5", children: jsxs("div", { className: "flex items-center gap-2", children: [jsx("span", { children: L(t.conditions) }), jsxs("span", { children: [t.temp, "\xB0C"] }), jsx("span", { children: t.conditions })] }) }) : jsx("div", { children: "Loading..." });
}, H = () => {
  const t = (/* @__PURE__ */ new Date()).getHours();
  return t >= 5 && t < 12 ? "Good Morning" : t >= 12 && t < 17 ? "Good Afternoon" : t >= 17 && t < 22 ? "Good Evening" : "Good Night";
}, N = ({ currentDate: t, onDateChange: n }) => jsxs("div", { className: "h-[7.5%] w-full flex justify-between items-center", children: [jsx("div", { className: "w-1/3 text-neutral-300", children: jsx("div", { className: "flex  gap-1 text-xs flex-col px-2.5", children: jsxs("h3", { children: [H(), ", Daniel Madeley"] }) }) }), jsx("div", { className: "w-1/3 text-center text-neutral-300 font-bold flex flex-col items-center justify-center gap-1", children: jsxs("div", { className: "flex items-end justify-center gap-1", children: [jsx("span", { className: "text-4xl", children: t.toLocaleDateString("en-US", { weekday: "long" }) }), jsx("span", { className: "text-sm", children: t.toLocaleDateString("en-US", { day: "numeric", month: "long" }).replace(/(\d+)/, (a) => {
  const o = parseInt(a), d = ["th", "st", "nd", "rd"][o % 10 > 3 ? 0 : o % 10];
  return `${o}${d}`;
}) })] }) }), jsxs("div", { className: "w-1/3 flex justify-end items-center gap-2 text-neutral-300 font-light", children: [jsx($, { currentDate: t, onDateChange: n }), jsx(R, {})] })] }), v = () => jsx("div", { className: "h-[77.5%] w-full p-2.5  ", children: jsxs("div", { className: " w-full flex flex-col justify-between h-full py-5 px-[20%] gap-5", children: [jsxs("div", { className: "h-1/4 w-full flex flex-col gap-2", children: [jsx("h2", { className: "text-xs text-neutral-300", children: "Recently Active" }), jsx("div", { className: "bg-neutral-800/50 rounded-md border border-neutral-600 flex-1" })] }), jsxs("div", { className: "h-2/4 w-full flex flex-col gap-2", children: [jsx("h2", { className: "text-xs text-neutral-300", children: "Upcoming Events" }), jsx("div", { className: "bg-neutral-800/50 rounded-md border border-neutral-600 flex-1" })] }), jsxs("div", { className: "h-1/4 w-full flex flex-col gap-2", children: [jsx("h2", { className: "text-xs text-neutral-300", children: "Recently Contacted" }), jsx("div", { className: "bg-neutral-800/50 rounded-md border border-neutral-600 flex-1" })] })] }) });
function ne() {
  const { currentDate: t, setCurrentDate: n } = Un();
  return jsxs("div", { className: "flex items-center justify-center h-full w-full rounded-md flex-col", children: [jsx(N, { currentDate: t, onDateChange: n }), jsx(v, {}), jsx(D, { currentDate: t, onDateChange: n })] });
}
const re = function() {
  const { currentDate: n, setCurrentDate: a } = Un();
  return jsxs("div", { className: "flex items-center justify-center h-full w-full rounded-md flex-col", children: [jsx(N, { currentDate: n, onDateChange: a }), jsx(v, {}), jsx(D, { currentDate: n, onDateChange: a })] });
};

export { re as component, ne as default };
//# sourceMappingURL=index-B-QvMD-v.mjs.map
