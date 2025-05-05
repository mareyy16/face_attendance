'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography } from 'antd'
// import type { MenuProps } from 'antd';
const { Text } = Typography;  

export default function UserDashboard() {
  
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
                    <Text>EMPLOYEES</Text>
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
