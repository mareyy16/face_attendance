'use client';
import * as React from 'react';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Alert from '@mui/material/Alert';
// import  Snackbar from '@mui/material/Snackbar';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography, Layout, Menu, theme } from 'antd'
import type { MenuProps } from 'antd';
import { useUserStore } from "@/stores/userStore";
import { usePageStore } from '@/stores/pageStore';
import { CalendarOutlined, LogoutOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import Image from 'next/image'
import SearchBarMUI from '@/components/SearchBarMUI';
import { usePathname, useRouter } from "next/navigation";
import MyFooter from '@/components/MyFooter';
const { Header, Content, Sider } = Layout;
const { Title } = Typography;


type MenuItem = Required<MenuProps>['items'][number];
// interface AttendanceData {
//     id: number;
//     name: string;
//     company_name: string;
//     designation: string;
//     date: string;
//     time_in: string;
//     time_out: string;
//   }
  
  
// interface RawAttendanceData {
//     attendance_id: number;
//     name: string;
//     company_name: string;
//     designation: string;
//     date: string;
//     time_in: string;
//     time_out: string;
//   }
  
//   interface AttendanceApiResponse {
//     data: RawAttendanceData[];
//   }
  
//   const columns: GridColDef<AttendanceData>[] = [
//     { field: 'id', headerName: 'ID', width: 90 },
//     { field: 'name', headerName: 'Name', flex: 1 },
//     { field: 'company_name', headerName: 'Company Name', flex: 1 },
//     { field: 'designation', headerName: 'Designation', flex: 1 },
//     { field: 'date', headerName: 'Date',  flex: 1 },
//     { field: 'time_in', headerName: 'Time In',  flex: 1 },
//     { field: 'time_out', headerName: 'Time Out',  flex: 1, sortable: false },
//   ];
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    disabled:boolean,
    icon?: React.ReactNode,
    type?: 'group' | 'divider',
    children?: MenuItem[],
    
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      disabled
    } as MenuItem;
  }
//   const menuItems: MenuItem[] = [{
//     key:'sub1',
//     label:'Main Menu',
//     type:'group',
//     children: [
//       {key:'1', label:'Profile', icon:<UserOutlined />},
//       {key:'2', label:'Employees',
//         // children:[{key:'2', label:'Employee Details'}], 
//         icon:<TeamOutlined /> },
//       {key:'3', label:'Register Face', icon:<ScanOutlined />},
//       {key:'4', label:'Logs', icon:<FileTextOutlined />},
//       // {key:'5', label:'Report'},
//       // {key:'6', label:'Activity Logs'},
//       {key:'7', label:'Employee Attendance', icon:<CalendarOutlined />},
//     ]
//   },
//   {
//     key:'sub2',
//     label:'Settings',
//     type:'group',
//     children: [
//       {key:'8', label:'Settings', icon:<SettingOutlined />},
//       {key:'9', label:'Logout', icon:<LogoutOutlined />},
//     ]
//   }
// ]
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  const items = [
        getItem('Profile', '/dashboard/profile', false, <UserOutlined />),
        getItem('Employees', '/dashboard/employees', false, <TeamOutlined />),
        getItem('Employee Attendance', '/dashboard/attendance', false, <CalendarOutlined />),
        getItem('Logout', '/logout', false, <LogoutOutlined />),
  ]
//   const [rows, setRows] = React.useState<AttendanceData[]>([]);
  const user = useUserStore((state)=>state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const page = usePageStore((state) => state.page)
  const clearPage = usePageStore((state) => state.clearPage);
  const setPage = usePageStore((state) => state.setPage)
  const {
    token: { colorBgContainer },
  } = theme.useToken();

    const pathname = usePathname();
      React.useEffect(() => {
        if(page && page.path){
            console.log("Last page path: ",page.path)
            router.push(page.path);
        }
        // const fetchAttendanceData = async () => {
        //   try {
        //     const response = await fetch('/api/attendance');
        //     if (!response.ok) throw new Error('Failed to fetch attendance data');
    
            // const json: AttendanceApiResponse = await response.json();
            // const mapped: AttendanceData[] = json.data.map((row: RawAttendanceData) => ({
            //   id: row.attendance_id,
            //   name: row.name,
            //   company_name: row.company_name,
            //   designation: row.designation,
            //   date: row.date.split("T")[0],
            //   time_in: row.time_in,
            //   time_out: row.time_out,
            // }));
    
            // setRows(mapped);
        //   } catch (error) {
        //     console.error('Error fetching attendance data:', error);
        //   }
        // };
    
        // fetchAttendanceData();
      }, []);
    // const [loading, setLoading] = React.useState<boolean>(false);
    // const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    // const [snackbarMessage, setSnackbarMessage] = React.useState('');
    // const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const router = useRouter();
    // const [formData, setFormData] = React.useState({
    //     hour: 1
    // });
    // const handleSubmit = async() => {
    //     setLoading(true);
    //     console.log('Submitting:', formData);
    //     // Send to backend here
    //     const response = await fetch('/api/login', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(formData),
    //     });
    //     setSnackbarOpen(false);
    //     const data = await response.json()
    //     console.log('Response:', data);
    //     setSnackbarMessage(data.error || 'Unknown response');
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

    return (
    
    <Layout style={{ minHeight: '100vh', padding:0 }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        style={{backgroundColor:'#FFFFFE'}}
      >
        <div style={{ height: 156 }} >
            <div style={{backgroundColor:'#233570', height:'89px', display:'flex', justifyContent:'center'}}>
            <Image
            src="/LBI---logo-white-icon.png"
            alt="Logicbase Logo"
            width={128}
            height={128}
            priority={true}
            style={{position:'absolute', top:'24px'}}/>
            </div>
        
        </div>
        <Title level={3} style={{textAlign:'center', marginTop:'0', fontWeight:700}}>Admin Dashboard</Title>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['/profile']} items={items}
        selectedKeys={[pathname]}
        onSelect={async(e)=>{
            if(e.key==='/logout'){
              console.log('Logging out...')
                const res = await fetch('/api/logout', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user&&user.id),
                  });
            
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  clearUser();
                  clearPage();
                  router.replace("/"); // Redirect to login page
                  return
            } else {
              setPage({path:e.key})
              router.push(e.key)
            }
        }}  />
      </Sider>
      <Layout>
        <Header style={{ height:'89px', padding: 0, background: colorBgContainer }} ><SearchBarMUI/></Header>
        <Content style={{ margin: '24px 16px 0', gap:'24px', display:'flex', flexDirection:'column' }}>
            {children}
                {/* <Card sx={{ width: '100%', p:3 }}>
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
                    
                    <Card
                    sx={{
                        width: '100%',
                        p: 3,
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
                    </Card> */}
        </Content>
        <MyFooter/>
      </Layout>
      {/* <Snackbar anchorOrigin={{ vertical: 'top', horizontal:'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar> */}
    </Layout>
    );
}
