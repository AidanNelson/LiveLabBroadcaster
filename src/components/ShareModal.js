import { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { ListItem, ListItemText, TextField } from "@mui/material";
import { List } from "@mui/material";
import { StageContext } from "./StageContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 4,
};
const useUserInfo = (userId) => {
  const [userInfo, setUserInfo] = useState({name: userId});

  useEffect(() => {
    async function getUserInfo() {
      const res = await fetch(`/api/user/${userId}/info`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(res);
      let json = await res.json();
      console.log(json);

      setUserInfo(json);
    }
    getUserInfo();
  },[userId]);

  return userInfo;
};
const EditorListItem = ({ uid }) => {
  const editorInfo = useUserInfo(uid);

  console.log("editorInfo:", editorInfo);
  if (!editorInfo) return null;
  return (
    <>
      <ListItem>
        <ListItemText>{editorInfo.name}</ListItemText>
      </ListItem>
    </>
  );
};

export default function ShareModal({ isOpen, setIsOpen }) {
  const handleClose = () => setIsOpen(false);
  const { editors } = useContext(StageContext);

  console.log({ editors });

  return (
    <div>
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Share This Venue
          </Typography>

          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 5 }}>
            Add additional editors to the space below
          </Typography>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: "80%", display: "inline-block" }}>
              <TextField
                id="outlined-basic"
                label="Invite Additional Editors"
                variant="outlined"
                placeholder="Email"
                size="small"
                fullWidth
              />
            </Box>
            <Button sx={{ ml: 2, mr: 2 }} variant="contained">
              Invite
            </Button>
          </Box>
          <Typography variant="h5">Editors</Typography>
          <List>
            {editors.map((uid, idx) => {
              return <EditorListItem uid={uid} key={idx} />;
            })}
          </List>
        </Box>
      </Modal>
    </div>
  );
}
