// shared layout for [slug] route (i.e. an individual event setup)

import { StageContextProvider } from "@/components/StageContext";
import { EditorContextProvider } from "@/components/Editor/EditorContext";
import { UserMediaContextProvider } from "@/components/UserMediaContext";
import { RedirectBasedOnShowState } from "./RedirectBasedOnShowState";

export async function generateMetadata({ params }) {
  const { slug } = await params;
}

export default async function Layout({ children, params }) {
  const { slug } = await params;
  return (
    <>
      <StageContextProvider slug={slug}>
        <EditorContextProvider>
          <UserMediaContextProvider>
            <RedirectBasedOnShowState />
            <main>{children}</main>
          </UserMediaContextProvider>
        </EditorContextProvider>
      </StageContextProvider>
    </>
  );
}
