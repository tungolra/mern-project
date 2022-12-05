import React, { useState } from "react";
import { Modal, useMantineTheme } from "@mantine/core";
import { update } from '../../utilities/UserRequests/users-service';
import axios from 'axios';
import './UpdatUserModal.css';


export default function UpdateUserModal({ user, setUser, modalOpened, setModalOpened }) {
  const [selectedFile, setSelectedFile] = React.useState(null);

  const theme = useMantineTheme();
  let state = {
    firstname: user.firstname ,
    lastname: user.lastname,
    email: user.email,
    profilePicture: user.profilePicture,
    about: user.about
  }
  const [formData, setFormData] = useState (state)
  //  const theme = useMantineTheme();
  

  function handleChange(e) {
    state[e.target.name] = e.target.value
    setFormData(state)
    console.log (state)
   }
  
  function handleFileSelect (e) {
    // state[e.target.name] = e.target.value
    setFormData({...formData, selectedFile: e.target.files[0]})
    setSelectedFile(e.target.files[0])
  }

  function handleSubmit(e) {
     e.preventDefault()
      // const data = new FormData()
      // data.append ('file', selectedFile)
        
     try {
      console.log (formData)
      console.log (state)
      const user = update(formData)
      setUser(user)
      // if (state.profilePicture) {
      //   console.log (formData)
      //   axios.post('/api/users/update', data , {
      //     headers: {
      //     "Content-type": "multipart/form-data",
      //   },
      // })
      // }
       
     } catch (error) {
       console.log ({error}) 
     }
  }
    
  return (
    <Modal
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
      opened={modalOpened}
      onClose={() => setModalOpened(false)}
    >
      <form onSubmit={handleSubmit}  encType="multipart/form-data">
      <div className="updateContainer">
        <h1>CHATTER BOX</h1>
        
        <img className="profileImg" src={state.profilePicture} />
          <div>
            <input
              defaultValue={state.firstname}
              onChange={handleFileSelect}
              type="text"
              className="infoInput"
              name="firstname"
              placeholder="First Name"
            />
            
            <input
              defaultValue={state.lastname}
              onChange={handleChange}
              type="text"
              className="infoInput"
              name="lastname"
              placeholder="Last Name"
            />

              <input
                defaultValue={state.email}
                onChange={handleChange}
                type="email"
                className="infoInput"
                name="email"
                placeholder="Email"       
              />
        
            <input
              
              onChange={handleFileSelect}
              type="file"
              className="infoInput custom-file-input"
              name="profilePicture"
              placeholder="Profile Picture"
            />
            
            <textarea
              defaultValue={state.about}
              onChange={handleChange}
              type="text"
              className="infoInput"
              rows="4" cols="40"
              name="about"
              placeholder="About ..."
            />
            <button 
            type="submit"
            className="submitBtn">Update</button>
          </div>     
      </div>
      </form>
    </Modal>
    
      
  );
}
