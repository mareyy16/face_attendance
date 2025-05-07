import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { User } from "@/stores/userStore";
type DialogFormProps = {
    user: User,
    open: boolean,
    onClose: () => void,
    onSubmit: (message:string, user:User) => void,
    onError: (error:string) => void
}
const EditUserFormDialog: React.FC<DialogFormProps> = ({user, open, onClose, onError, onSubmit}) => {
    // const [open, setOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        contact_number: '',
        designation: '',
        company_name: '',
    });
    React.useEffect(() => {
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            contact_number: user.contact_number || '',
            designation: user.designation || '',
            company_name: user.company_name || '',
          });
        }
      }, [user]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <React.Fragment>
        {user&&<Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: 
                    async(event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    // const email = formJson.email;
                    // console.log(email);
                    const response = await fetch(`/api/edit-user/${user.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formJson),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        onSubmit(data.message, data.user); // Pass the updated user data back to the parent
                    } else {
                        onError(data.error);
                    }
                    onClose();
                    },
                },
            }}
        >
            <DialogTitle>Edit User</DialogTitle>
                
            <DialogContent>
            <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="standard"
                value={formData.name}
                onChange={handleChange}
            />
            <TextField
                autoFocus
                required
                margin="dense"
                id="email"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={formData.email}
                onChange={handleChange}
            />
            <TextField
                required
                margin="dense"
                id="contact_number"
                name="contact_number"
                label="Contact Number"
                type="number"
                fullWidth
                variant="standard"
                value={formData.contact_number}
                onChange={handleChange}
            />
            <TextField
                required
                margin="dense"
                id="designation"
                name="designation"
                label="Designation"
                type="text"
                fullWidth
                variant="standard"
                value={formData.designation}
                onChange={handleChange}
            />
            <TextField
                required
                margin="dense"
                id="company_name"
                name="company_name"
                label="Company Name"
                type="text"
                fullWidth
                variant="standard"
                value={formData.company_name}
                onChange={handleChange}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>}
        </React.Fragment>
    );
}

export default EditUserFormDialog;