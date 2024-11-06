import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useUser } from "../hooks/useUser";
import {  useStageContext } from "./StageContext";

export const Header = ({toggleEditorShown}) => {
  const user = useUser();
  const {stageInfo} = useStageContext();

  return (
    <AppBar
      variant="dense"
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Button onClick={toggleEditorShown}>EDIT</Button>
        <Typography variant="h6" noWrap component="div">
          LiveLabBroadcaster - {stageInfo.title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
