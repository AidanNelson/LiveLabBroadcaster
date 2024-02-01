import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useUser } from "../auth/hooks";
import { useContext } from "react";
import { StageContext } from "./StageContext";

export const Header = ({toggleEditorShown, setShowShareModal}) => {
  const user = useUser();
  const {stageId} = useContext(StageContext);

  return (
    <AppBar
      variant="dense"
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Button onClick={toggleEditorShown}>EDIT</Button>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Venue - {stageId}
        </Typography>
        <Button onClick={() => setShowShareModal(true)}>SHARE</Button>
      </Toolbar>
    </AppBar>
  );
};
