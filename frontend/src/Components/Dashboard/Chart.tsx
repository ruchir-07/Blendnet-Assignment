import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, axisClasses } from '@mui/x-charts';
import { ChartsTextStyle } from '@mui/x-charts/ChartsText';
import Title from './Title';

export default function Chart(props: any) {
    const theme = useTheme();

    return (
        <React.Fragment>
            <Title>Today | {props.data.symbol}</Title>
            <div style={{ width: '100%', flexGrow: 1 }}>
                <LineChart
                    dataset={props.data.prices}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 70,
                        bottom: 40,
                    }}
                    xAxis={[
                        {
                            scaleType: 'time',
                            dataKey: 'timestamp',
                            label: 'Time',
                            tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
                        },
                    ]}
                    yAxis={[
                        {
                            label: 'Price ($)',
                            labelStyle: {
                                ...(theme.typography.body1 as ChartsTextStyle),
                                fill: theme.palette.text.primary,
                            },
                            tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
                        },
                    ]}
                    series={[
                        {
                            dataKey: 'close',
                            showMark: false,
                            color: theme.palette.primary.light,
                        },
                    ]}
                    sx={{
                        [`.${axisClasses.root} line`]: { stroke: theme.palette.text.secondary },
                        [`.${axisClasses.root} text`]: { fill: theme.palette.text.secondary },
                        [`& .${axisClasses.left} .${axisClasses.label}`]: {
                            transform: 'translateX(-25px)',
                        },
                    }}
                />
            </div>
        </React.Fragment>
    );
}
