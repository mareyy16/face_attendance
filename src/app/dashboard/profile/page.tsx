'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useUserStore } from '@/stores/userStore';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography } from 'antd'
// import type { MenuProps } from 'antd';
const { Text } = Typography;  

export default function UserDashboard() {
    const user = useUserStore((state)=>state.user)
    const fetchData = async (id:number) => {
        try {
            const response = await fetch(`api/profile/${id}`);
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

    return (
      <>
        <Card
        sx={{
            width: '100%',
            p: 3,
        }}
        >
            <CardContent>
                <Box sx={{ mt: 2 }}>
                    <Text>PROFILE?</Text>
                    <TextField
                    fullWidth
                    label="Enter hours"
                    name="hour"
                    margin="normal"
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                >
                    Save
                </Button>
            </CardActions>
        </Card>
      </>
    );
}
