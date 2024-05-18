// Type definitions for the Dashboard component
export interface APIResponse {
    watchList: string[],
    message: string,
    success: boolean,
}

export interface PriceData {
    timestamp: Date;
    close: number;
    volume: string;
}

export interface StockData {
    symbol: string;
    prices: PriceData[];
}

export interface cardProps {
    data: StockData[]
    setActiveIndex: (index: number) => void
    removeStock: (s:string) => void
}

export interface ChartProps {
    data: PriceData[]
}