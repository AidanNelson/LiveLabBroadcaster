// shared layout for [slug] route (i.e. an individual event setup)

import { StageContextProvider } from "@/components/StageContext";
import { EditorContextProvider } from "@/components/Editor/EditorContext";
import { UserMediaContextProvider } from "@/components/UserMediaContext";

import { NavBarAndNavBarHeightContextProvider } from "@/components/NavBar/NavBarAndNavBarHeightContextProvider";

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
            <NavBarAndNavBarHeightContextProvider>
              {children}
            </NavBarAndNavBarHeightContextProvider>
          </UserMediaContextProvider>
        </EditorContextProvider>
      </StageContextProvider>
    </>
  );
}
