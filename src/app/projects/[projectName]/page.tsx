import Projects from "../../../views/Projects";
import { PROJECTS } from "../../../data/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ projectName: p.id! }));
}

export default async function Page({ params }: { params: Promise<{ projectName: string }> }) {
  const { projectName } = await params;
  return <Projects projectName={projectName} />;
}
