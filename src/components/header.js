import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useUser } from "../auth/hooks";
import { useContext } from "react";
import { StageContext } from "./StageContext";

export const Header = ({toggleEditorShown, setShowShareModal}) => {
  const user = useUser();
  const {stageId} = useContext(StageContext);

  return (
   <>
        <button onClick={toggleEditorShown}>EDIT</button>
        <div>
          Venue - {stageId}
          </div>
        <button onClick={() => setShowShareModal(true)}>SHARE</button>
        </>
  );
};
