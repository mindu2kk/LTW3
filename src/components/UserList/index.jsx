import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchModel("https://5my2f7-8081.csb.app/user/list")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Loi khi tai danh sach UserList:", error);
      });
  }, []);
  return (
    <div>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Danh sách người dùng
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <Link to={`/users/${user._id}`}>
              <ListItem>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                />
              </ListItem>
            </Link>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
