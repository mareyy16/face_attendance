'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import  Snackbar from '@mui/material/Snackbar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from "next/navigation";
import { Typography } from 'antd'
const { Text } = Typography;
interface AttendanceData {
    id: number;
    name: string;
    company_name: string;
    designation: string;
    date: string;
    time_in: string;
    time_out: string;
  }
  
  
interface RawAttendanceData {
    attendance_id: number;
    name: string;
    company_name: string;
    designation: string;
    date: string;
    time_in: string;
    time_out: string;
  }
  
  interface AttendanceApiResponse {
    data: RawAttendanceData[];
  }
  
  const columns: GridColDef<AttendanceData>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'company_name', headerName: 'Company Name', flex: 1 },
    { field: 'designation', headerName: 'Designation', flex: 1 },
    { field: 'date', headerName: 'Date',  flex: 1 },
    { field: 'time_in', headerName: 'Time In',  flex: 1 },
    { field: 'time_out', headerName: 'Time Out',  flex: 1, sortable: false },
  ];
export default function UserDashboard() {
    const [rows, setRows] = React.useState<AttendanceData[]>([]);
    
      React.useEffect(() => {
        const fetchAttendanceData = async () => {
          try {
            const response = await fetch('/api/attendance');
            if (!response.ok) throw new Error('Failed to fetch attendance data');
    
            const json: AttendanceApiResponse = await response.json();
            const mapped: AttendanceData[] = json.data.map((row: RawAttendanceData) => ({
              id: row.attendance_id,
              name: row.name,
              company_name: row.company_name,
              designation: row.designation,
              date: row.date.split("T")[0],
              time_in: row.time_in,
              time_out: row.time_out,
            }));
    
            setRows(mapped);
          } catch (error) {
            console.error('Error fetching attendance data:', error);
          }
        };
    
        fetchAttendanceData();
      }, []);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const router = useRouter();
    const [formData, setFormData] = React.useState({
        hour: 1
    });
    const handleSubmit = async() => {
        setLoading(true);
        console.log('Submitting:', formData);
        // Send to backend here
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        setSnackbarOpen(false);
        const data = await response.json()
        console.log('Response:', data);
        setSnackbarMessage(data.error || 'Unknown response');
        setSnackbarSeverity(data.error ? 'error' : 'success');
        setSnackbarOpen(true);
        setLoading(false);
        if(!response.ok){
            throw new Error("Error signing up");
        }
        router.push("/dashboard");
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
    <>
    <Box sx={{ width: '100%' }}>
        <Box
            sx={{
            width: '90%',
            maxWidth: 600,
            padding: '20px',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            }}
        >
        <Card sx={{ width: 900 }}>
            <CardContent>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { pageSize: 5, page: 0 },
                    },
                    }}
                    pageSizeOptions={[5, 10, 15]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </CardContent>
        </Card>
        </Box>
        <Box
            sx={{
            width: '90%',
            maxWidth: 600,
            padding: '20px',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            }}
        >
            
            <Card
            sx={{
                width: '100%',
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
            }}
            >
                <CardContent>
                    <Box sx={{ mt: 2 }}>
                        <Text>How long would you be on duty today?</Text>
                        <TextField
                        fullWidth
                        label="Enter hours"
                        name="hour"
                        value={formData.hour}
                        onChange={handleChange}
                        margin="normal"
                        />
                    </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        loading={snackbarOpen}
                        disabled={loading}
                    >
                        Save
                    </Button>
                </CardActions>
            </Card>
        </Box>
    </Box>
    <Snackbar anchorOrigin={{ vertical: 'top', horizontal:'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </>
    );
}
