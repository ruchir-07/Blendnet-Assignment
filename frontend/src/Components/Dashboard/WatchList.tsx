import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Button } from '@material-ui/core';
import { cardProps } from './types';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClassNames } from '@emotion/react';

const useStyles = makeStyles(() => ({
    button: {
        height: '100%',
        backgroundColor: "#0d6efd",
        color: "white",
        '&:hover': {
            backgroundColor: "#3f51b5",
        }
    }
    
}));

const Watchlist: React.FC<cardProps> = (props) => {
    const classes = useStyles();
    return (
        <React.Fragment>
            <Title>Watch List</Title>
            <strong>If data is same for all the stocks, AlphaVantage API limit has been exhausted, and data is fetched using API key "demo"</strong>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Stock</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Volume</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        props.data.map((stock: any, index: number) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{stock['symbol']}</TableCell>
                                    <TableCell>{stock['prices'][0].close}</TableCell>
                                    <TableCell>{stock['prices'][0].volume}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => { props.setActiveIndex(index) }} className={classes.button}>
                                            Show Trends
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => { props.removeStock(stock['symbol']) }}>
                                            <DeleteIcon />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                    {
                        props.data.length === 0 &&
                        <TableRow>
                            <TableCell colSpan={5}>
                                No stocks in the watchlist
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </React.Fragment>
    );
}

export default Watchlist;