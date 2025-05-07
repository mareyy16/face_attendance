'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useUserStore, User } from "@/stores/userStore";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import  Snackbar from '@mui/material/Snackbar';
import { Avatar } from '@mui/material';
// import { useRouter } from "next/navigation";
import { CalendarOutlined } from '@ant-design/icons';
import { Typography as AntTypography, Statistic, Space } from 'antd';
import EditUserFormDialog from './EditUserFormDialog';
const { Text } = AntTypography;
export const dynamic = 'force-dynamic';
export default function EmployeeProfileCard() {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    // const [loading, setLoading] = React.useState<boolean>(false);
    // const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state) => state.user);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    // const router = useRouter();
    // const [formData, setFormData] = React.useState({
    //     email: '',
    //     password: '',
    // });
    if(user){
        console.log('loaded');
    }
    const handleDialogClose = () => {
        setDialogOpen(false);
      };
    
    const handleDialogSubmit = (message:string, updatedUserData: User) => {
        // Update the user store with the new data
        setUser(updatedUserData);
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setDialogOpen(false);
    };
    const handleDialogError = (error:string) => {
        // Update the user store with the new data
        setSnackbarMessage(error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setDialogOpen(false);
    };
    const fetchData = async (id:number) => {
            try {
                const response = await fetch(`dashboard/api/profile-attendance/${id}`);
                if (!response.ok) throw new Error('Failed to fetch attendance data');
                const data = await response.json()
                console.log('Data: ', data);
            }
            catch (error){
                console.error(error);
            }
        }
        React.useEffect(()=>{
            if(user&&user.id){
                fetchData(user.id);
            }
        },[])

    // const handleSubmit = async() => {
    //     setLoading(true);
    //     setIsEditing(false);
    //     console.log('Submitting:', formData);
    //     // Send to backend here
    //     if(!user){
    //         return;
    //     }
    //     const response = await fetch(`/api/edit-user/${user.id}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(formData),
    //     });
    //     setSnackbarOpen(false);
    //     const data = await response.json()
    //     // console.log('Response:', data);
    //     setUser({
    //         id:data.id,
    //         name:data.name, 
    //         email:data.email, 
    //         role:data.role,
    //         company_name: data.company_name,
    //         designation: data.designation,
    //         profile_image: data.profile_image,
    //         contact_number:data.contact_number,
    //         age:data.age
    //         })
    //     console.log('profile image: ', data.profile_image);
    //     setSnackbarMessage(data.message || data.error || 'Unknown response');
    //     setSnackbarSeverity(data.error ? 'error' : 'success');
    //     setSnackbarOpen(true);
    //     setLoading(false);
    //     if(!response.ok){
    //         throw new Error("Error signing up");
    //     }
    //     router.push("/dashboard");
    // };
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };
    return(
        <>
        <Box
            sx={{
            display: 'flex',
            // justifyContent: 'center',
            alignItems: 'flex-start',
            }}
        >
            <Card
            sx={{
                width: '100%',
                p: 3,
                // borderRadius: 3,
                // boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
            }}
            >
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        PROFILE
                    </Typography>
                
                    {user&&
                    <>
                    <Box sx={{display:"flex", flexDirection:"row", alignItems:"center", gap:'32px', flexWrap:'wrap'}}>
                        <Avatar
                        alt={user.name}
                        src={user.profile_image}
                        sx={{ width: 150, height: 150, mr: 2 }}
                        />
                        <Statistic title="Name" value={user.name} valueStyle={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}/>
                        <Statistic title="Company" value={user.company_name} valueStyle={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}/>
                        <Statistic title="Designation" value={user.designation} valueStyle={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}/>
                        {/* <Statistic title="Contact Number" decimalSeparator={''} value={user.contact_number} valueStyle={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}/> */}
                        <Space direction='vertical' >
                            <Text style={{color:'rgba(0,0,0,0.45)'}}>Contact Number</Text>
                            <Text style={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}>{user.contact_number}</Text>
                        </Space>
                    </Box>
                    <Box sx={{display:"flex", flexDirection:"row", alignItems:"center", gap:'24px', pt:3}}>
                        <Card sx={{p: 3}}>
                            <Space>
                                <CalendarOutlined style={{fontSize:'48px', marginRight:'12px'}}/>
                                <Space direction='vertical' style={{alignItems:'center'}}>
                                    <Text style={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}>2</Text>
                                    <Text style={{color:'rgba(0,0,0,0.45)'}}>Total Attendance</Text>
                                </Space>
                            </Space>
                        </Card>
                        <Card sx={{p: 3}}>
                            <Space>
                                <CalendarOutlined style={{fontSize:'48px', marginRight:'12px'}}/>
                                <Space direction='vertical' style={{alignItems:'center'}}>
                                    <Text style={{fontWeight:"bold", fontSize:'20px', color:'#1669B2'}}>26.7 hours</Text>
                                    <Text style={{color:'rgba(0,0,0,0.45)'}}>Total Hours</Text>
                                </Space>
                            </Space>
                        </Card>
                    </Box>
                    </>
                    }
                </CardContent>
                <CardActions sx={{ justifyContent: 'end', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={()=> setDialogOpen(true)}
                        loading={snackbarOpen}
                        // disabled={loading}
                    >
                        Edit
                    </Button>
                </CardActions>
                <EditUserFormDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    onSubmit={handleDialogSubmit}
                    user={user}
                    onError={handleDialogError}
                />
            </Card>
        </Box>
        
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal:'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
    </>
    )
}