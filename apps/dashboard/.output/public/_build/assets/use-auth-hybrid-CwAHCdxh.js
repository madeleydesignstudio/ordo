import{c as h,A as g,r as f,t as i,z as y}from"./client-D9jdpKMx.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],p=h("LoaderCircle",w);function A(){const r=g(),[c,s]=f.useState(!1),{data:o,isLoading:u,refetch:e}=i.auth.getSession.useQuery(),a=i.auth.signOut.useMutation({onSuccess:()=>{r.invalidateQueries(),e()}}),d=async t=>{s(!0);try{await y.signIn.social({provider:"google",callbackURL:t||(typeof window<"u"&&window.location.hostname==="localhost"?"http://localhost:3001":"https://dashboard.dev-0af.workers.dev")}),await e()}catch(n){throw console.error("OAuth sign-in failed:",n),n}finally{s(!1)}},l=async()=>{try{await a.mutateAsync()}catch(t){throw console.error("Sign out failed:",t),t}};return{session:o,isAuthenticated:!!o?.data?.user,isLoading:u||c||a.isPending,signInWithGoogle:d,signOut:l,refetchSession:e}}export{p as L,A as u};
