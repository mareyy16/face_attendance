'use client';
import { useEffect, useState } from 'react';
// import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import { useUserStore } from '@/stores/userStore';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { Typography } from 'antd'
// import type { MenuProps } from 'antd';
import { DateTime } from 'luxon';

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
// const { Text } = Typography;  
export default function UserDashboard() {
    // const user = useUserStore((state)=>state.user)
    const [rows, setRows] = useState<AttendanceData[]>([]);
    useEffect(() => {
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
              date: DateTime.fromISO(row.date).toFormat("DDD"),
              time_in: row.time_in?DateTime.fromFormat(row.time_in, "TT").toFormat("tt"):"Not yet recorded",
              time_out: row.time_out?DateTime.fromFormat(row.time_out,"TT").toFormat("tt"):"Not yet recorded"
            }));
    
            setRows(mapped);
          } catch (error) {
            console.error('Error fetching attendance data:', error);
          }
        };
    
        fetchAttendanceData();
      }, []);

    return (
        <Card sx={{ width: '100%', p:3 }}>
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
    )
}