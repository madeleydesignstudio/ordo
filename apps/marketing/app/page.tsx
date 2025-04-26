import Hero from "@/components/hero";
import FinanceManagement from "@/components/finance-management";
import ProjectManagement from "@/components/project-management";
import ContentManagement from "@/components/content-management";
import Image from "next/image";

export default function Home() {
  return (
    <div >
     <Hero />
     <FinanceManagement />
     <ProjectManagement />
     <ContentManagement />
    </div>
  );
}
