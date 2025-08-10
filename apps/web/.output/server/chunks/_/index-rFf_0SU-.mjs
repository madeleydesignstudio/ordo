import { jsxs } from 'react/jsx-runtime';
import * as fs from 'node:fs';
import { useRouter } from '@tanstack/react-router';
import { R as Route, c as createServerFn, a as createServerRpc } from './ssr.mjs';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

const filePath = "count.txt";
async function readCount() {
  return parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
}
const updateCount_createServerFn_handler = createServerRpc("src_routes_index_tsx--updateCount_createServerFn_handler", "/_serverFn", (opts, signal) => {
  return updateCount.__executeServer(opts, signal);
});
const updateCount = createServerFn({
  method: "POST"
}).validator((d) => d).handler(updateCount_createServerFn_handler, async ({
  data
}) => {
  const count = await readCount();
  await fs.promises.writeFile(filePath, `${count + data}`);
});
const SplitComponent = function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
    updateCount({
      data: 1
    }).then(() => {
      router.invalidate();
    });
  }, children: [
    "Hello ",
    state,
    "! Click me!"
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-rFf_0SU-.mjs.map
