import { jsx, jsxs } from 'react/jsx-runtime';
import { ArrowUpDown, MoreHorizontal, CheckIcon } from 'lucide-react';
import { v as ve, E as E$1, g } from '../nitro/nitro.mjs';
import * as y from '@radix-ui/react-checkbox';
import * as d from '@radix-ui/react-dropdown-menu';
import { useReactTable, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import * as F from 'react';
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

function S({ className: e, ...a }) {
  return jsx(y.Root, { "data-slot": "checkbox", className: g("peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", e), ...a, children: jsx(y.Indicator, { "data-slot": "checkbox-indicator", className: "flex items-center justify-center text-current transition-none", children: jsx(CheckIcon, { className: "size-3.5" }) }) });
}
function R({ ...e }) {
  return jsx(d.Root, { "data-slot": "dropdown-menu", ...e });
}
function I({ ...e }) {
  return jsx(d.Trigger, { "data-slot": "dropdown-menu-trigger", ...e });
}
function D({ className: e, sideOffset: a = 4, ...n }) {
  return jsx(d.Portal, { children: jsx(d.Content, { "data-slot": "dropdown-menu-content", sideOffset: a, className: g("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", e), ...n }) });
}
function f({ className: e, inset: a, variant: n = "default", ...c }) {
  return jsx(d.Item, { "data-slot": "dropdown-menu-item", "data-inset": a, "data-variant": n, className: g("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", e), ...c });
}
function A({ className: e, children: a, checked: n, ...c }) {
  return jsxs(d.CheckboxItem, { "data-slot": "dropdown-menu-checkbox-item", className: g("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", e), checked: n, ...c, children: [jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: jsx(d.ItemIndicator, { children: jsx(CheckIcon, { className: "size-4" }) }) }), a] });
}
function H({ className: e, inset: a, ...n }) {
  return jsx(d.Label, { "data-slot": "dropdown-menu-label", "data-inset": a, className: g("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", e), ...n });
}
function K({ className: e, ...a }) {
  return jsx(d.Separator, { "data-slot": "dropdown-menu-separator", className: g("bg-border -mx-1 my-1 h-px", e), ...a });
}
const L = [{ id: "select", header: ({ table: e }) => jsx(S, { checked: e.getIsAllPageRowsSelected() || e.getIsSomePageRowsSelected() && "indeterminate", onCheckedChange: (a) => e.toggleAllPageRowsSelected(!!a), "aria-label": "Select all" }), cell: ({ row: e }) => jsx(S, { checked: e.getIsSelected(), onCheckedChange: (a) => e.toggleSelected(!!a), "aria-label": "Select row" }), enableSorting: false, enableHiding: false }, { accessorKey: "firstName", header: ({ column: e }) => jsxs(E$1, { variant: "ghost", onClick: () => e.toggleSorting(e.getIsSorted() === "asc"), children: ["First Name", jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })] }) }, { accessorKey: "lastName", header: ({ column: e }) => jsxs(E$1, { variant: "ghost", onClick: () => e.toggleSorting(e.getIsSorted() === "asc"), children: ["Last Name", jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })] }) }, { accessorKey: "company", header: ({ column: e }) => jsxs(E$1, { variant: "ghost", onClick: () => e.toggleSorting(e.getIsSorted() === "asc"), children: ["Company", jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })] }) }, { accessorKey: "phone", header: "Phone" }, { accessorKey: "email", header: ({ column: e }) => jsxs(E$1, { variant: "ghost", onClick: () => e.toggleSorting(e.getIsSorted() === "asc"), children: ["Email", jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })] }) }, { accessorKey: "status", header: "Status", cell: ({ row: e }) => {
  const a = e.getValue("status");
  return jsx("div", { className: `inline-px-2 py-1 rounded-full text-xs font-medium
          ${a === "active" ? "text-green-500" : ""}
          ${a === "inactive" ? "text-red-500" : ""}
          ${a === "lead" ? "text-yellow-500" : ""}
          ${a === "customer" ? "text-blue-500" : ""}
        `, children: a.charAt(0).toUpperCase() + a.slice(1) });
} }, { id: "actions", cell: ({ row: e }) => {
  const a = e.original;
  return jsxs(R, { children: [jsx(I, { asChild: true, children: jsxs(E$1, { variant: "ghost", className: "h-8 w-8 p-0", children: [jsx("span", { className: "sr-only", children: "Open menu" }), jsx(MoreHorizontal, { className: "h-4 w-4" })] }) }), jsxs(D, { align: "end", children: [jsx(H, { children: "Actions" }), jsx(f, { onClick: () => navigator.clipboard.writeText(a.id), children: "Copy Contact ID" }), jsx(K, {}), jsx(f, { children: "Edit Contact" }), jsx(f, { children: "View Details" }), jsx(f, { children: "View Company" })] })] });
} }];
function j({ className: e, ...a }) {
  return jsx("div", { "data-slot": "table-container", className: "relative w-full overflow-x-auto", children: jsx("table", { "data-slot": "table", className: g("w-full caption-bottom text-sm", e), ...a }) });
}
function E({ className: e, ...a }) {
  return jsx("thead", { "data-slot": "table-header", className: g("[&_tr]:border-b", e), ...a });
}
function J({ className: e, ...a }) {
  return jsx("tbody", { "data-slot": "table-body", className: g("[&_tr:last-child]:border-0", e), ...a });
}
function w({ className: e, ...a }) {
  return jsx("tr", { "data-slot": "table-row", className: g("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", e), ...a });
}
function B({ className: e, ...a }) {
  return jsx("th", { "data-slot": "table-head", className: g("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", e), ...a });
}
function k({ className: e, ...a }) {
  return jsx("td", { "data-slot": "table-cell", className: g("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", e), ...a });
}
function U({ columns: e, data: a }) {
  var _a, _b, _c;
  const [n, c] = F.useState([]), [u, C] = F.useState([]), [v, h] = F.useState({}), [g, x] = F.useState({}), l = useReactTable({ data: a, columns: e, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: c, getSortedRowModel: getSortedRowModel(), onColumnFiltersChange: C, getFilteredRowModel: getFilteredRowModel(), onColumnVisibilityChange: h, onRowSelectionChange: x, state: { sorting: n, columnFilters: u, columnVisibility: v, rowSelection: g } });
  return jsxs("div", { className: "w-full", children: [jsxs("div", { className: "flex items-center py-4 gap-4", children: [jsx(ve, { placeholder: "Filter emails...", value: (_b = (_a = l.getColumn("email")) == null ? void 0 : _a.getFilterValue()) != null ? _b : "", onChange: (o) => {
    var _a2;
    return (_a2 = l.getColumn("email")) == null ? void 0 : _a2.setFilterValue(o.target.value);
  }, className: "max-w-sm bg-neutral-950 border-neutral-600 text-neutral-300 placeholder:text-neutral-500" }), jsxs(R, { children: [jsx(I, { asChild: true, children: jsx(E$1, { variant: "outline", className: "ml-auto border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200", children: "Columns" }) }), jsx(D, { align: "end", className: "bg-neutral-900 border-neutral-600", children: l.getAllColumns().filter((o) => o.getCanHide()).map((o) => jsx(A, { className: "capitalize text-neutral-300 hover:bg-neutral-800 focus:bg-neutral-800", checked: o.getIsVisible(), onCheckedChange: (s) => o.toggleVisibility(!!s), children: o.id }, o.id)) })] })] }), jsx("div", { className: "rounded-md border border-neutral-600 bg-neutral-950", children: jsxs(j, { children: [jsx(E, { className: "border-b border-neutral-600", children: l.getHeaderGroups().map((o) => jsx(w, { className: "hover:bg-neutral-900", children: o.headers.map((s) => jsx(B, { className: "text-neutral-300 font-medium", children: s.isPlaceholder ? null : flexRender(s.column.columnDef.header, s.getContext()) }, s.id)) }, o.id)) }), jsx(J, { children: ((_c = l.getRowModel().rows) == null ? void 0 : _c.length) ? l.getRowModel().rows.map((o) => jsx(w, { "data-state": o.getIsSelected() && "selected", className: "hover:bg-neutral-900 border-b border-neutral-800 last:border-0", children: o.getVisibleCells().map((s) => jsx(k, { className: "text-neutral-300", children: flexRender(s.column.columnDef.cell, s.getContext()) }, s.id)) }, o.id)) : jsx(w, { children: jsx(k, { colSpan: e.length, className: "h-24 text-center text-neutral-500", children: "No results." }) }) })] }) }), jsxs("div", { className: "flex items-center justify-end space-x-2 py-4", children: [jsx(E$1, { variant: "outline", size: "sm", onClick: () => l.previousPage(), disabled: !l.getCanPreviousPage(), className: "border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50", children: "Previous" }), jsx(E$1, { variant: "outline", size: "sm", onClick: () => l.nextPage(), disabled: !l.getCanNextPage(), className: "border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50", children: "Next" })] })] });
}
function G() {
  const e = ["John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Emily", "Robert", "Lisa"], a = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"], n = ["Acme Corp", "Globex", "Soylent Corp", "Initech", "Umbrella Corp", "Hooli", "Stark Industries", "Wayne Enterprises", "Cyberdyne", "Oscorp"], c = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "company.com"], u = ["active", "inactive", "lead", "customer"];
  return Array.from({ length: 100 }, (C, v) => {
    const h = e[Math.floor(Math.random() * e.length)], g = a[Math.floor(Math.random() * a.length)], x = n[Math.floor(Math.random() * n.length)];
    return { id: `${Math.random().toString(36).substring(2, 10)}${v}`, firstName: h, lastName: g, company: x, phone: `+1${Math.floor(Math.random() * 1e9).toString().padStart(10, "0")}`, email: `${h.toLowerCase()}.${g.toLowerCase()}@${c[Math.floor(Math.random() * c.length)]}`, status: u[Math.floor(Math.random() * u.length)] };
  });
}
async function O() {
  return G();
}
const be = async function() {
  const a = await O();
  return jsx("div", { className: "container mx-auto py-10", children: jsx(U, { columns: L, data: a }) });
};

export { be as component };
//# sourceMappingURL=index-BnE275PU.mjs.map
