'use client';
import * as React from 'react';
import type { SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CameraCapture from '@/components/CameraCapture';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import  Snackbar from '@mui/material/Snackbar';
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
const steps = ['Basic Info', 'Company Details', 'Face Registration'];

interface CompanyOptionType {
  value: string;
}
const CompanyOptions : CompanyOptionType[] = [
  { value: 'Logicbase Interactive Ent.' },
  { value: 'MoneyCache' },
  // { value: 'Intalio Estates' },
  // { value: 'Intalio Flats' }
];
  
export default function RegisterStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [startScan, setStartScan] = React.useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success')
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    company: '',
    designation: '',
    age: '' as number | string,
    contact_number: ''
  });
  // const [imageData, setImageData] = React.useState<string>('');
  let imageData:string;
  const router = useRouter();
  const setImageData = (data: string) => {
    imageData = data;
  }
  const handleSubmit = async() => {
    console.log('Submitting:', formData);
    // Send to backend here
    const response = await fetch('/api/register-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({formData, imageData}),
    });

    setSnackbarOpen(false);
    const data = await response.json()
    console.log('Response:', data);
    setSnackbarMessage(data.message || data.error || 'Unknown response');
    setSnackbarSeverity(data.message ? 'success' : 'error');
    setSnackbarOpen(true);
      if(!response.ok){
        throw new Error("Error signing up");
      }
      setUser({
        id:data.id,
        name:formData.name, 
        email:formData.email, 
        role:data.role,
        company_name: formData.company,
        designation: formData.designation,
        contact_number:formData.contact_number,
        age:formData.age
      })
      router.push("/dashboard");
  };
  const sendFrames = async (frames: { label: string; data: string }[]) => {
    try {
        const res = await fetch('/api/face-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ frames }),
        });
  
        const result = await res.json();
        setSnackbarMessage(result.message || result.error || 'Unknown response');
        setSnackbarSeverity(result.message ? 'success' : 'error');
        setSnackbarOpen(true);
        handleSubmit();
    } catch (err) {
        console.error('Failed to send frames:', err);
        setSnackbarMessage('Failed to send frames');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
};
    const [collectedFrames, setCollectedFrames] = React.useState<
    { label: string; data: string }[]
    >([]);
    React.useEffect(() => {
      console.log('formData:', formData);
    }, [formData]);
    const maxFrames = 5;
    const handleFrameCapture = (base64Image: string) => {
        if (collectedFrames.length < maxFrames) {
          setCollectedFrames((prev) => [
            ...prev,
            { label: formData.name, data: base64Image },
          ]);
        }
      };
    React.useEffect(() => {
        if (collectedFrames.length === maxFrames) {
            console.log('Collected frames:', collectedFrames[0].data);
            setImageData(collectedFrames[0].data);
            sendFrames(collectedFrames);
        }
    }, [collectedFrames]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleAutocompleteChange = (
    event: SyntheticEvent<Element, Event>,
    value: CompanyOptionType | null,
    // reason: AutocompleteChangeReason,
    // details?: AutocompleteChangeDetails<CompanyOptionType> | undefined
  ) => {
    setFormData({ ...formData, company: value?.value ?? '' });
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return formData.name && formData.email && formData.password && formData.contact_number && formData.age;
    } else if (activeStep === 1) {
      return formData.company && formData.designation;
    }
    // Assume face registration always valid here (you can adjust this)
    return true;
  };

  const defaultProps = {
    options: CompanyOptions,
    getOptionLabel: (option: CompanyOptionType) => option.value,
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
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
            <TextField
              fullWidth
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            
            <Autocomplete
              {...defaultProps}
              id="auto-select"
              autoSelect
              value={{ value: formData.company } as CompanyOptionType}
              // value={CompanyOptions.find(option => option.value === formData.company)}
              onChange={handleAutocompleteChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Company Name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  margin="normal"
                />
              )}
            />
            <TextField
              fullWidth
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Position your face within the frame. The system will capture and register your facial data.
            </Typography>
            {/* Insert webcam feed here */}
            <CameraCapture onFrameCapture={handleFrameCapture} startScan={startScan}/>
            {/* <Box sx={{ width: '100%', height: '200px', bgcolor: '#f0f0f0', borderRadius: 2 }} /> */}
          </Box>
        );
      default:
        return null;
    }
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
              Register
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', mt: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 && (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
              variant="contained"
              color="primary"
              onClick={() => setStartScan(true)}
              loading={snackbarOpen}
              disabled={startScan}
            >
              {!startScan?"Register Face":"Scanning face..."}
              </Button>
            )}
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
