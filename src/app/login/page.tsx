'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import  Snackbar from '@mui/material/Snackbar';
import { useRouter } from "next/navigation";
export default function RegisterStepper() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
    const router = useRouter();
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
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
                    <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                        Login
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        />
                        <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
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
                        Login
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
