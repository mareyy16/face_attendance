'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import {Card, CardContent} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface AttendanceData {
  attendance_id: number;
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

const AttendancePage = () => {
  const [rows, setRows] = React.useState<AttendanceData[]>([]);

  React.useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (!response.ok) throw new Error('Failed to fetch attendance data');

        const json: AttendanceApiResponse = await response.json();
        const mapped: AttendanceData[] = json.data.map((row: RawAttendanceData) => ({
          attendance_id: row.attendance_id,
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

  return (
    <Box 
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    bgcolor="#f5f5f5"
    // sx={{ height: 400, width: '100%' }}
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
  );
};

export default AttendancePage;
