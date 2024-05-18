import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../constants';
import Swal from 'sweetalert2';

// Styles for the component
const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        backgroundColor: "#0d6efd"
    },
    button: {
        height: '100%',
        backgroundColor: "#0d6efd",
        color: "white"
    },
    google: {
        backgroundColor: "#e53a13",
        color: "white",
        flexDirection: 'row',
        margin: theme.spacing(0, 0, 3)
    }
}));

// Interface for the component
interface ResetPasswordProps {
    email: string,
    password: string,
    otp: string,
    otpSent: boolean
}

export default function SignUp() {

    const classes = useStyles();
    const navigator = useNavigate();

    // State for the component
    const [data, setData] = useState<ResetPasswordProps>({
        email: "",
        password: "",
        otp: "",
        otpSent: false
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    // Function to send OTP to the user's email
    const sendOtp = async () => {

        const response = await fetch(`${url}/auth/forgot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
            body: JSON.stringify({ email: data.email })
        });

        const json = await response.json();

        if (json.success === true) {
            setData({ ...data, otpSent: true });
            Swal.fire({
                title: "OTP Sent",
                text: "An OTP has been sent to your email",
                icon: "success"
            });
        } else {
            Swal.fire({
                title: "Error",
                text: json.message,
                icon: "error"
            });
        }
    }

    // Function to sign up the user
    const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const response = await fetch(`${url}/auth/forgot/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                authcode: parseInt(data.otp),
            })
        });

        const json = await response.json();
        if (json.success === true) {
            navigator('/signin');
        } else {
            Swal.fire({
                title: "Error",
                text: json.message,
                icon: "error"
            });
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <form className={classes.form} noValidate onSubmit={resetPassword}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                disabled={!data.otpSent}
                                id="otp"
                                label="Verification Code"
                                name="otp"
                                autoComplete="otp"
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                type="button"
                                variant="contained"
                                color="inherit"
                                className={classes.button}
                                onClick={sendOtp}
                            >
                                Send OTP
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={onChange}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Reset Password
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link to='/signin'>
                                back
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
}