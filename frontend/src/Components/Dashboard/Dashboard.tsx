import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from './Chart';
import Watchlist from './WatchList';
import LogoutIcon from '@mui/icons-material/Logout';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import STOCK_LIST from './stocks.json'
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { url } from '../constants';
import { useNavigate } from 'react-router-dom';
import { APIResponse, PriceData, StockData } from './types';

// Styles for the component
const useStyles = makeStyles(() => ({
    button: {
        height: '100%',
        backgroundColor: "#0d6efd",
    }
}));


const Dashboard: React.FC = () => {

    const classes = useStyles();
    const navigate = useNavigate();
    const [search, setSearch] = React.useState<string>("");
    const [name, setName] = React.useState<string>("");
    const [stockData, setStockData] = React.useState<StockData[]>([]);
    const [stockList, setStockList] = React.useState<string[]>([]);
    const [activeIndex, setActiveIndex] = React.useState<number>(0);
    const [chartData, setChartData] = React.useState<StockData>({ symbol: "", prices: [{ timestamp: new Date(), close: 0, volume: "" }] });

    // check for API key
    const [exhausted, setExhausted] = React.useState<boolean>(false);

    // Function to fetch the watchlist data from the server
    const fetchData = async () => {
        const response = await fetch(`${url}/watchlist/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "auth-token": localStorage.getItem("auth-token") || "",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
        });

        const json: APIResponse = await response.json();
        if (json.success) {
            setStockList(json.watchList);
        }
    }

    // Function to fetch user data from the server
    const fetchUserData = async () => {
        const response = await fetch(`${url}/auth/verifyuser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "auth-token": localStorage.getItem("auth-token") || "",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
        });

        const json = await response.json();
        // Invalid token
        if (!json.success) {
            navigate("/signin");
        }

        setName(json.user.name);
        await fetchData();
    }

    // Function to parse the response from the alphavantage API
    const parseResponse = (data: any, symbol: string): StockData => {

        const result: StockData = {
            symbol: symbol,
            prices: []
        };

        const timeSeries = data["Time Series (5min)"];
        for (const timestamp in timeSeries) {
            const priceData = timeSeries[timestamp];
            result.prices.push({
                timestamp: new Date(timestamp),
                close: parseFloat(priceData['4. close']),
                volume: priceData['5. volume']
            });
        }

        return result;
    };

    // Function to fetch the stock data from the alphavantage API
    const fetchStockData = async () => {
        const promises = stockList.map(async (symbol) => {

            let res, d;
            if (!exhausted) {
                res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=demo`);
                d = await res.json();
            }

            if (exhausted || res === undefined || d["Time Series (5min)"] === undefined) {
                setExhausted(true);
                res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo`);
                d = await res.json();
            }

            return parseResponse(d, symbol);
        });

        const parsedData = await Promise.all(promises);
        if (parsedData.length > activeIndex) {
            setChartData(parsedData[activeIndex]);
        }
        setStockData(parsedData);
    }

    // Check if the user is valid and authenticated
    React.useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            navigate("/signin");
        }
        fetchUserData();
    }, []);

    // Fetch the stock data when the stock list changes
    React.useEffect(() => {
        fetchStockData();
    }, [stockList]);

    // Update the chart data
    React.useEffect(() => {
        if (stockData.length > 0) {
            setChartData(stockData[activeIndex]);
        }
    }, [activeIndex]);

    // Function to add a stock to the watchlist
    const addStock = async () => {
        const sym = search.match(/\(([^)]+)\)/);
        if (sym === null || sym.length < 2) {
            return;
        }

        await fetch(`${url}/watchlist/add/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "auth-token": localStorage.getItem("auth-token")?.toString() || "",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
            body: JSON.stringify({
                symbol: sym[1]
            })
        });

        setSearch("");
        fetchData();
    }

    // Function to remove a stock from the watchlist
    const removeStock = async (s: string) => {
        await fetch(`${url}/watchlist/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "auth-token": localStorage.getItem("auth-token")?.toString() || "",
            },
            mode: "cors",
            referrerPolicy: "origin-when-cross-origin",
            body: JSON.stringify({
                symbol: s
            })
        });

        fetchData();
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <MuiAppBar position="absolute">
                <Toolbar>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}
                    >
                        Hi, {name}
                    </Typography>
                    <IconButton color="inherit" onClick={() => {
                        localStorage.removeItem("auth-token");
                        navigate("/signin");
                    }}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </MuiAppBar>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>

                        <Grid item xs={10}>
                            <Autocomplete
                                options={STOCK_LIST.map((option) => option)}
                                renderInput={(params) => <TextField {...params} label="Add Stocks" />}
                                value={search}
                                onChange={(event, value) => setSearch(value || "")}
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                onClick={addStock}
                            >
                                Add
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '400px',
                                }}
                            >
                                <Chart data={chartData} />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: "310px", overflowY: "scroll" }}>
                                <Watchlist data={stockData} setActiveIndex={setActiveIndex} removeStock={removeStock} />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}


export default Dashboard;
