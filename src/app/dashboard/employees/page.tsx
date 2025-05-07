'use client';
import { useEffect, useState } from 'react';
// import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Tag } from 'antd'
// import type { MenuProps } from 'antd';
// const { Text } = Typography;  
interface EmployeesData {
    id: number;
    name: string;
    company_name: string;
    designation: string;
    contact_number: string;
    date: string;
}
  
  
  interface AttendanceApiResponse {
    data: EmployeesData[];
  }
  
  const columns: GridColDef<EmployeesData>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'company_name', headerName: 'Company Name', flex: 1 },
    { field: 'designation', headerName: 'Designation', flex: 1 },
    { field: 'contact_number', headerName: 'Contact Number', flex: 1 },
    { field: 'date', headerName: 'Status',  flex: 1,
        renderCell: (params) => {
            return params.value ? (
                <Tag color="green">Present</Tag>
            ) : (
                <Tag color="red">Absent</Tag>
            );
        }
     },
  ];
export default function UserDashboard() {
    const [rows, setRows] = useState<EmployeesData[]>([]);
    useEffect(() => {
            const fetchAttendanceData = async () => {
              try {
                const response = await fetch('/api/employees');
                if (!response.ok) throw new Error('Failed to fetch attendance data');
        
                const json: AttendanceApiResponse = await response.json();
                const mapped: EmployeesData[] = json.data.map((row: EmployeesData) => ({
                    id: row.id,
                    name: row.name,
                    company_name: row.company_name,
                    designation: row.designation,
                    date: row.date,
                    contact_number: row.contact_number,
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
    );
}
